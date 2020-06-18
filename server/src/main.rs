use futures::{
    channel::mpsc::{self, UnboundedSender},
    future,
    sink::SinkExt,
    stream::{StreamExt, TryStreamExt},
};
use std::{
    collections::HashMap,
    io::Error,
    sync::{Arc, Mutex},
};
use tokio::{
    net::{TcpListener, TcpStream},
    task,
};
use tokio_tungstenite::{accept_async, tungstenite::protocol::Message};

#[tokio::main]
async fn main() -> Result<(), Error> {
    let addr = "127.0.0.1:9001";
    let mut listener = TcpListener::bind(addr).await?;
    println!("started server at {}", addr);

    let clients = Arc::new(Mutex::new(HashMap::new()));
    let state = Arc::new(Mutex::new(String::new()));
    let mut id = 0;
    while let Ok((stream, _addr)) = listener.accept().await {
        task::spawn(handle_connection(
            stream,
            id,
            clients.clone(),
            state.clone(),
        ));
        id += 1;
    }

    Ok(())
}

async fn handle_connection(
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
