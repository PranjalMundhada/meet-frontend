import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import io from 'socket.io-client'
import { connect } from "react-redux";
import { storage, firestore, db } from "../../server/firebase.js";
import "./Messaging.css";
import send from '../../assets/send.png'
import chaticon from '../../assets/chat.png'
import peopleicon from '../../assets/people.png'
import attachments from '../../assets/attachments.png'

// const firepadRef = db.database().ref();
const storageRef = storage.ref();

const Messaging = (props) => {

  const {roomId} = useParams();
  const location = useLocation();
  const isAdminParam = new URLSearchParams(location.search).get('isAdmin');
  const isAdmin = isAdminParam === 'true';
  // const updatedFirepadRef = firepadRef.child(roomId); 
  // const messagesRef = updatedFirepadRef.child("messagesRef");
  const navigate = useNavigate();
  const socketRef = useRef();
  const [attachment, setAttachment] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState(false);
  const [chatBubble, setChatBubble] = useState(false);
  const chatInputRef = useRef();
  const [people, setPeople] = useState(false);
  const currentUser = props.currentUser
    ? Object.values(props.currentUser)[0]
    : null;
  const participants = props.participants;
  const [shouldSendMessage, setShouldSendMessage] = useState(false);

  const messagesCollectionRef = firestore.collection(`messages`).doc(roomId);
  messagesCollectionRef.get().then(docSnapshot => {
    if (!docSnapshot.exists) {
        firestore.collection(`messages`).doc(roomId).set({}); 
    }
  });

  const sendMessage = useCallback(async (status) => {
    // console.log("Sending message:", message);
    const statusAttachment = status;
    let filename;
    if(statusAttachment) {
      const decodeURL = decodeURIComponent(message); 
      filename = decodeURL.split('/').pop().split('?')[0]; 
    } else {
      filename = "";
    }
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    await messagesCollectionRef.update({
      [Date.now()]: {
        message: message,
        time: currentTime,
        userName: currentUser.name,
        statusAttachment: statusAttachment,
        filename: filename 
      }
    });

    socketRef.current.emit('user-message', { message, time: currentTime, userName: currentUser.name, statusAttachment, filename });
    setMessage(''); 
  }, [message, socketRef])

  const handleMessage = useCallback(({ message, time, userName, statusAttachment, filename }) => {
    setMessages(prevMessages => [
        ...prevMessages,
        { message, time, userName, statusAttachment, filename }
    ]);
    if(!chat) { //if chat is closed
        setChatBubble(true);
    }
  }, [])

  useEffect(() => {
    socketRef.current = io.connect(`${process.env.REACT_APP_BACKEND}`);
    socketRef.current.on('message', handleMessage);
    return () => {
        socketRef.current.off('message', handleMessage);
    }
  }, [socketRef, handleMessage]);

  // useEffect(() => {
  //   isAdmin && messagesRef.set({ messages });
  // }, [messages])

  useEffect(() => {
    if (shouldSendMessage) {
      sendMessage(true);
      setShouldSendMessage(false);
    }
  }, [message, shouldSendMessage, sendMessage]);

  const handleAttachmentChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const snapshot = await storageRef.child(`attachments-${roomId}/${file.name}`).put(file);
      const downloadURL = await snapshot.ref.getDownloadURL();
      const fullMessage = `${downloadURL}`;
      setMessage(fullMessage);
      setShouldSendMessage(true);

    } catch (error) {
      console.error('Error uploading attachment:', error);
    }
  };

  const handleSummaryPage = () => {
    navigate(`/summary/${roomId}`);
  }

  return (
    <div className="messaging">

      <div style={{position:"fixed", bottom:"15px", right:"1000px"}}>
        <button onClick={handleSummaryPage} className="messaging-button">Summary Page</button>
      </div>

      <div className={`${chat ? 'chat' : 'chat-hide'}`}>

        <div className='chat-title'>
            <h3>In-call Messages</h3>
        </div>

        <div className='chat-messages'>
          {messages.map((msg, index) => (
            <div key={index} style={{ marginBottom: "13px" }}>

              {index > 0 && messages[index - 1].userName === msg.userName ? ( // Check if the previous message has the same user
                <div style={{ fontSize: "11px", marginTop: "-10px" }}>
                  {}
                </div>
              ) : (
                <div style={{ fontSize: "11px", marginBottom: "3px" }}>
                  <b style={{ fontSize: "13px", marginRight: "5px" }}>{msg.userName}</b> {msg.time}
                </div>
              )}

              <div style={{ fontSize: "14px", overflowWrap: "break-word" }}>
                {msg.statusAttachment ? (
                  <a href={msg.message} target="_blank" rel="noopener noreferrer">{msg.filename}</a>
                ) : (
                  msg.message
                )}
              </div>

            </div>
          ))}
        </div>


        <div className='chat-input'>
            <label htmlFor="attachment">
                <img src={attachments} alt="attachments" style={{marginLeft:"10px", cursor:"pointer"}} />
            </label>
            <input
                id="attachment"
                type="file"
                value={attachment}
                onChange={handleAttachmentChange}
                style={{ display: 'none' }} 
            />
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter Message"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        sendMessage(false);
                    }
                }}
                autoFocus={chat} //whenever chat is true
                ref={chatInputRef} // Reference for input element
            />
            <img src={send} alt="send" onClick={sendMessage}/>
        </div>

      </div>
      {/* chat image */}
      <img 
        src={chaticon} 
        alt="chaticon"
        style={{width:"30px", height:"30px", position:"absolute", bottom:"15px", right:"30px", cursor:"pointer"}} 
        onClick={() => {
            // if(!chat) {
            //     chatInputRef.current.focus();
            // }
            setChat(!chat); 
            setPeople(false);
            chatBubble && setChatBubble(false);
        }} 
      />
      {chatBubble && !chat && (
        <div style={{width:"10px", height:"10px", borderRadius:"5px" ,backgroundColor:"#508bf2", position:"absolute", bottom:"40px", right:"35px", cursor:"pointer"}}></div>
      )}


      <div className={`${people ? 'chat' : 'chat-hide'}`}>

        <div className='chat-title'>
            <h3>Participants</h3>
        </div>

        <div className='people-messages'>
          {Object.keys(participants).map(key => {
            const participant = participants[key];
            return (
              <div key={key}>
                {participant.name === currentUser.name ? (
                  <p>{participant.name} (You)</p>
                ) : (
                  <p>{participant.name}</p>
                )}
              </div>
            );            
          })}
        </div>

      </div>
      {/* people image */}
      <img src={peopleicon} alt="peopleicon" onClick={() => {setPeople(!people); setChat(false)}} style={{width:"30px", height:"25px", position:"absolute", bottom:"15px", right:"90px", cursor:"pointer"}} />


    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    participants: state.participants,
    currentUser: state.currentUser,
  };
};

export default connect(mapStateToProps)(Messaging);

