import "./Summary.css";
import { useState, useEffect } from "react";
import { db, firestore } from "../../server/firebase";

// const firepadRef = db.database().ref();

function MeetRecording({ roomId }) {

  const [videoData, setVideoData] = useState(null);
  // const updatedFirepadRef = firepadRef.child(roomId); 
  // const videoRecordingRef = updatedFirepadRef.child("videoRecording");

  // useEffect(() => {
  //   videoRecordingRef.once("value").then((snapshot) => {
  //     const data = [];
  //     snapshot.forEach((childSnapshot) => {
  //       const key = childSnapshot.key; // The key (timestamp)
  //       const value = childSnapshot.val(); // The value (URL)
  //       data.push(value);
  //       // console.log("key", key + " value", value);
  //     });
  //     setVideoData(data);
  //   })
  //   .catch((error) => {
  //     console.error("Error retrieving video recording data:", error);
  //   });
  // }, []);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const videoRecordingSnapshot = await firestore.collection("videoRecording").doc(roomId).get();
        if (videoRecordingSnapshot.exists) {
          const videoRecordingData = videoRecordingSnapshot.data();
          const latestKey = Object.keys(videoRecordingData).sort().pop();
          const latestData = videoRecordingData[latestKey];
          setVideoData(latestData.url);
        } else {
          console.error("No video recording found for roomId:", roomId);
        }
      } catch (error) {
        console.error("Error retrieving video recording data:", error);
      }
    };

    fetchVideoData();
  }, [roomId, firestore, setVideoData]);


  return (
    <div className="MeetRecording">
      {/* {videoData && videoData.map((video) => (
        <div key={Object.keys(video)} >
          
          <h3>Video Recorded at: {Object.keys(video)}</h3>
          <video controls>
            <source src={Object.values(video)[0]} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

        </div>
      ))} */}

      {videoData ? (
        <div>
          <video controls>
            <source src={videoData} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        <div>Loading video...</div>
      )}

    </div>
  );
}

export default MeetRecording;
