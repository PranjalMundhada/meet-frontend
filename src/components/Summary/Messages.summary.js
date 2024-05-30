import "./Summary.css";
import { useState, useEffect } from "react";
import { firestore } from "../../server/firebase";

function Messages({ roomId }) {

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messagesSnapshot = await firestore.collection("messages").doc(roomId).get();
        const messagesData = messagesSnapshot.data();
        setMessages(messagesData);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [roomId]);

  return (
    <div className="Messages">
      <p>Messages</p>
      {Object.keys(messages).map((key, index) => {
        const msg = messages[key];
        return (
          <div key={index} style={{ marginBottom: "13px" }}>
            <div style={{ fontSize: "11px", marginBottom: "3px" }}>
              <b style={{ fontSize: "13px", marginRight: "5px" }}>{msg.userName}</b> {msg.time}
            </div>
            <div style={{ fontSize: "14px", overflowWrap: "break-word" }}>
              {msg.statusAttachment ? (
                <a href={msg.message} target="_blank" rel="noopener noreferrer">{msg.filename}</a>
              ) : (
                msg.message
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Messages;
