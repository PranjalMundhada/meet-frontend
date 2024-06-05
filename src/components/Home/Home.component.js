import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './Home.css'
import copy from '../../assets/copy.png'
import { firestore } from '../../server/firebase';

const Home = () => {

    const [id, setId] = useState();
    const [roomState, setRoomState] = useState(true);
    const [createName, setCreateName] = useState();
    const [createEmail, setCreateEmail] = useState();
    const [joinName, setJoinName] = useState();
    const [joinEmail, setJoinEmail] = useState();
    const [roomId, setroomId] = useState();
    const navigate = useNavigate();

    useEffect(() => {
        //generating a random 9-digit alphanumeric string
        const alphanumeric = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let randomString = '';
        for (let i = 0; i < 9; i++) {
            randomString += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
            if((i+1)%3 === 0 && i !== 8) {
                randomString += '-';
            }
        }
        setId(randomString);
    }, [setId]);

    const handleCopyRoomId = useCallback(() => {
        navigator.clipboard.writeText(id);
    }, [id]);

    const handleCreateRoom = useCallback(async (e) => {
        e.preventDefault();
        const emailIdCollectionRef = firestore.collection('emailId').doc(id);
        await emailIdCollectionRef.set({}, { merge: true });
        await emailIdCollectionRef.update({
            [Date.now()]: {
                name: createName,
                email: createEmail
            }
        });
        const endCallCollectionRef = firestore.collection('endCall').doc(id);
        await endCallCollectionRef.set({}, { merge: true });
        await endCallCollectionRef.update({
            [Date.now()]: {
                endCall: false
            }
        });
        navigate(`/room/${id}?name=${createName}&isAdmin=true`);
    }, [createName, createEmail, id]);

    const handleJoinRoom = useCallback(async (e) => {
        e.preventDefault();
        const emailIdCollectionRef = firestore.collection('emailId').doc(roomId);
        await emailIdCollectionRef.update({
            [Date.now()]: {
              name: joinName,
              email: joinEmail
            }
        });
        navigate(`/room/${roomId}?name=${joinName}`)
    }, [joinName, joinEmail, roomId]);

    return (
        <center>
            <div className='home'>
                {roomState ? (
                    <div>
                        <h4>Create Room</h4>
                        <form onSubmit={handleCreateRoom}>
                            <label htmlFor="createName">Name</label>
                            <input 
                                type="text" 
                                id="createName"
                                value={createName} 
                                onChange={(e) => setCreateName(e.target.value)}
                            />
                            <label htmlFor="createEmail">Email</label>
                            <input 
                                type="email" 
                                id="createEmail"
                                value={createEmail} 
                                onChange={(e) => setCreateEmail(e.target.value)}
                            />
                            <div>
                                <label htmlFor="createRoom">Room ID</label>
                                <img src={copy} alt='copy' onClick={handleCopyRoomId} />
                            </div>
                            <input 
                                key="createRoom" 
                                type="text" 
                                id="createRoom" 
                                value={id} 
                            />
                            <button>Create Room</button>
                            <p>Want to join room? <span onClick={() => setRoomState(!roomState)}>Click here</span></p>
                        </form>
                    </div>
                ) : (
                    <div>
                        <h4>Join Room</h4>
                        <form onSubmit={handleJoinRoom}>
                            <label htmlFor="joinName">Name</label>
                            <input 
                                type="text" 
                                id="joinName"
                                value={joinName} 
                                onChange={(e) => setJoinName(e.target.value)}
                            />
                            <label htmlFor="joinEmail">Email</label>
                            <input 
                                type="email" 
                                id="joinEmail"
                                value={joinEmail} 
                                onChange={(e) => setJoinEmail(e.target.value)}
                            />
                            <label htmlFor="joinRoom">Room ID</label>
                            <input 
                                key="joinRoom"
                                type="text" 
                                id="joinRoom"
                                value={roomId} 
                                onChange={(e) => setroomId(e.target.value)}
                            />
                            <button>Join Room</button>
                            <p>Want to create room? <span onClick={() => setRoomState(!roomState)}>Click here</span></p>
                        </form>
                    </div>
                )}
                
            </div>
        </center>
    )
}

export default Home
