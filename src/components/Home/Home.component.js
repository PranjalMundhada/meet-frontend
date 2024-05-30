import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import copy from '../../assets/copy.png'
import './Home.css'

const Home = () => {

    const [id, setId] = useState();
    const [roomState, setRoomState] = useState(true);
    const [createName, setCreateName] = useState();
    const [joinName, setJoinName] = useState();
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

    const handleCreateRoom = useCallback((e) => {
        e.preventDefault();
        navigate(`/room/${id}?name=${createName}&isAdmin=true`);
    }, [createName, id]);

    const handleJoinRoom = useCallback((e) => {
        e.preventDefault();
        navigate(`/room/${roomId}?name=${joinName}`)
    }, [joinName, roomId]);

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
                            <br />
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
                            <br />
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
                            <br />
                            <label htmlFor="joinRoom">Room ID</label>
                            <input 
                                key="joinRoom"
                                type="text" 
                                id="joinRoom"
                                value={roomId} 
                                onChange={(e) => setroomId(e.target.value)}
                            />
                            <br />
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
