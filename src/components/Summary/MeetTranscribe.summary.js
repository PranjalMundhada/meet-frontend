import './Summary.css';
import { useEffect, useState } from "react";
import axios from "axios";
import { firestore } from '../../server/firebase';

function MeetTranscribe({ setTranscribed, onChunksChange, onTextChange, roomId }) {
  const [chunks, setChunks] = useState([]);
  const [text, setText] = useState('');

  const transcribeCollectionRef = firestore.collection(`transcribe`).doc(roomId);
  transcribeCollectionRef.get().then(docSnapshot => {
    if (!docSnapshot.exists) {
        firestore.collection(`transcribe`).doc(roomId).set({}); 
    }
  });

  const handleVideoFile = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("videoFile", file);

    try {
      const response = await axios.post(`${REACT_APP_TRANSCRIBE}/api/ml`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const { chunks, text } = response.data;
      await transcribeCollectionRef.update({
        [Date.now()]: {
          chunks: chunks,
          text: text
        }
      });

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  //if already saved in firestore fetch that data
  useEffect(() => {
    const fetchTranscriptionData = async () => {
      const docSnapshot = await transcribeCollectionRef.get();
      if (docSnapshot.exists) {
        const transcribeData = docSnapshot.data();
        if (transcribeData) {
          const latestKey = Object.keys(transcribeData).sort().pop();
          const latestData = transcribeData[latestKey];

          if (latestData) {
            setChunks(latestData.chunks);
            setText(latestData.text);
            onChunksChange(latestData.chunks);
            onTextChange(latestData.text);
            setTranscribed(true);
          }
        }
      }
    };

    fetchTranscriptionData();
  }, [roomId, transcribeCollectionRef, onChunksChange, onTextChange, text, setText, chunks, setChunks, setTranscribed]);

  return (
    <div className="MeetTranscribe">
      <input 
        type="file" 
        id="file"
        onChange={handleVideoFile}
      />

      <div>
        {text ? (
          <>
            <h3>Transcription Chunks:</h3>
            <ul>
              {chunks.map((chunk, index) => (
                <li key={index}>
                  {`(${chunk.timestamp[0]}, ${chunk.timestamp[1]})`} {chunk.text}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <div>Transcripting...</div>
          </>
        )}
      </div>

    </div>
  );
}

export default MeetTranscribe;
