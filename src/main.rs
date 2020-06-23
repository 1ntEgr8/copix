use futures::{
    channel::mpsc::{self, UnboundedSender},
    future,
    sink::SinkExt,
    stream::{StreamExt, TryStreamExt},
};
use hyper::{
    service::{make_service_fn, service_fn},
    Body, Method, Request, Response, Server, StatusCode,
};
use std::{
    collections::HashMap,
    convert::Infallible,
    fs::File,
    io::{prelude::*, BufReader, Error},
    sync::{Arc, Mutex},
};
use tokio::{
    net::{TcpListener, TcpStream},
    task,
};
use tokio_tungstenite::{accept_async, tungstenite::protocol::Message};

async fn handle_request(req: Request<Body>) -> Result<Response<Body>, Error> {
    let mut response = Response::new(Body::empty());
    println!("{:#?}", req);
    match (req.method(), req.uri().path()) {
        (&Method::GET, "/") => {
            let file = File::open("public/index.html")?;
            let mut buf_raader = BufReader::new(file);
            let mut contents = Vec::new();
            buf_reader.read_to_end(&mut contents)?;
            *response.body_mut() = Body::from(contents);
        }
        _ => {
            *response.status_mut() = StatusCode::NOT_FOUND;
        }
    }

    Ok(response)
}

async fn register_client(
    stream: TcpStream,
    id: i32,
    clients: Arc<Mutex<HashMap<i32, UnboundedSender<Message>>>>,
    state: Arc<Mutex<String>>,
) {
    let ws = accept_async(stream)
        .await
        .expect("Error during websocket handshake");

    let (tx, rx) = mpsc::unbounded();
    clients.lock().unwrap().insert(id, tx);

    let (mut sink, stream) = ws.split();
    let current_state: String = state.lock().unwrap().to_string();
    sink.send(Message::Text(current_state)).await.unwrap();

    let broadcast = stream.try_for_each(|msg| {
        let mut state = state.lock().unwrap();
        state.push_str(format!("{}/", msg.to_string()).as_str());

        let clients = clients.lock().unwrap();
        let recipients = clients
            .iter()
            .filter(|(client_id, _)| client_id != &&id)
            .map(|(_, rx)| rx);
        for recipient in recipients {
            recipient.unbounded_send(msg.clone()).unwrap();
        }
        future::ok(())
    });
    let receive = rx.map(Ok).forward(sink);
    future::select(broadcast, receive).await;

    clients.lock().unwrap().remove(&id);
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    let addr = std::net::SocketAddr::from(([127, 0, 0, 1], 3000));
    let socket_addr = "127.0.0.1:9001";
    let h1 = task::spawn(service_task(addr));
    let h2 = task::spawn(socket_task(socket_addr));
    let (_service_result, _socket_result) = tokio::join!(h1, h2);
    Ok(())
}

async fn service_task(addr: std::net::SocketAddr) -> Result<(), Error> {
    let make_svc =
        make_service_fn(|_conn| async { Ok::<_, Infallible>(service_fn(handle_request)) });

    let server = Server::bind(&addr).serve(make_svc);
    println!("Listening on {}", addr);

    if let Err(e) = server.await {
        eprintln!("server error: {}", e);
    }
    Ok(())
}

async fn socket_task(socket_addr: &str) -> Result<(), Error> {
    let mut socket_listener = TcpListener::bind(socket_addr).await?;
    println!("Listening for socket connections on {}", socket_addr);

    let clients = Arc::new(Mutex::new(HashMap::new()));
    let state = Arc::new(Mutex::new(String::new()));
    let mut id = 0;
    while let Ok((stream, _addr)) = socket_listener.accept().await {
        task::spawn(register_client(stream, id, clients.clone(), state.clone()));
        id += 1;
    }

    Ok(())
}
