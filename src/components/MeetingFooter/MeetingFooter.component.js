import React, { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./MeetingFooter.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faVideo,
  faDesktop,
  faVideoSlash,
  faMicrophoneSlash,
  faCircle,
  faSquare,
  faPhone
} from "@fortawesome/free-solid-svg-icons";
import ReactTooltip from "react-tooltip";
import { ReactMediaRecorder } from 'react-media-recorder';
import { storage, db, firestore } from "../../server/firebase.js";
import { connect } from "react-redux";
import {
  setMainStream,
  addParticipant,
  setUser,
  removeParticipant,
  updateParticipant,
  removeAllParticipants,
} from "../../store/actioncreator";

// const firepadRef = db.database().ref();
const storageRef = storage.ref();

const MeetingFooter = (props) => {

  const navigate = useNavigate();
  const {roomId} = useParams();
  const location = useLocation();
  const isAdminParam = new URLSearchParams(location.search).get('isAdmin');
  const isAdmin = isAdminParam === 'true';

  // const updatedFirepadRef = firepadRef.child(roomId);
  const videoRecordingCollectionRef = firestore.collection(`videoRecording`).doc(roomId);
  videoRecordingCollectionRef.get().then(docSnapshot => {
    if (!docSnapshot.exists) {
        firestore.collection(`videoRecording`).doc(roomId).set({}); 
    }
  });
  
  
  const [record, setRecord] = useState(false);
  const [streamState, setStreamState] = useState({
    mic: true,
    video: false,
    screen: false,
    record: false,
  });

  const onRecordClick = () => {
    setStreamState((currentState) => {
      return {
        ...currentState,
        record: !currentState.record,
      };
    });
  }

  const onEndCallClick = async () => { 
    const participantRef = db.database().ref(`/${roomId}`);
  
    participantRef.remove()
    .then(() => {
      console.log('All users removed from participantRef');
    })
    .catch(error => {
      console.error('Error removing all users from participantRef:', error);
    });

    const stream = props.mainStream;
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      props.setMainStream(null);
    }

    props.removeAllParticipants();
    // props.setUser(null);

    const endCallCollectionRef = firestore.collection('endCall').doc(roomId);
    await endCallCollectionRef.set({}, { merge: true });
    await endCallCollectionRef.update({
        [Date.now()]: {
            endCall: true
        }
    });
    
    navigate(`/summary/${roomId}`);
  };

  const onMicClick = () => { //toggles mic
    setStreamState((currentState) => {
      return {
        ...currentState,
        mic: !currentState.mic,
      };
    });
  };

  const onVideoClick = () => { //toggles video
    setStreamState((currentState) => {
      return {
        ...currentState,
        video: !currentState.video,
      };
    });
  };

  const onScreenClick = () => { 
    props.onScreenClick(setScreenState);
  };

  const setScreenState = (isEnabled) => {
    setStreamState((currentState) => {
      return {
        ...currentState,
        screen: isEnabled,
      };
    });
  };

  useEffect(() => {
    props.onMicClick(streamState.mic);
  }, [streamState.mic]);

  useEffect(() => {
    props.onVideoClick(streamState.video);
  }, [streamState.video]);

  const handleStopRecording = useCallback((blobUrl) => {
    fetch(blobUrl)
        .then(response => response.blob())
        .then(blob => {
            const newBlob = new Blob([blob], { type: 'video/mp4' });
            setRecord(false);

            // const videoRecordingRef = updatedFirepadRef.child("videoRecording");
            const videoFileName = `recorded-media-(${roomId})-${Date.now()}.mp4`;
            const videoRef = storageRef.child('videoRecording/' + videoFileName);

            //save video in storage
            videoRef.put(newBlob).then((snapshot) => {
              console.log('Video uploaded successfully');

              videoRef.getDownloadURL().then(async (url) => {
                // const timestamp = new Date().toISOString().replace(/[^\w]/g, '_');
                // videoRecordingRef.push().set({ [timestamp]: url });
                await videoRecordingCollectionRef.update({
                  [Date.now()]: {
                    url: url
                  }
                });
              })

            })
            .catch((error) => {
              console.error('Error uploading video:', error);
            });
        })
        .catch(error => {
            console.error('Error fetching blob:', error);
        });
  }, []);

  return (
    <div className="meeting-footer">

      {/* Recording */}
      <ReactMediaRecorder
        screen
        render={({ startRecording, stopRecording, mediaBlobUrl }) => (
          <div
            className={"meeting-icons active"}
            data-tip={streamState.record ? "Stop Recording" : "Start Recording"}
            onClick={() => {
              if (streamState.record) {
                stopRecording();
                setRecord(true);
              } else {
                startRecording();
              };
              onRecordClick();
            }}
          >
            {record && mediaBlobUrl && handleStopRecording(mediaBlobUrl)}
            <FontAwesomeIcon
              icon={!streamState.record ? faCircle : faSquare}
              title="Recorder"
            />
          </div>
        )}
      />
      
      {/* Audio */}
      <div
        className={"meeting-icons " + (!streamState.mic ? "active" : "")}
        data-tip={streamState.mic ? "Mute Audio" : "Unmute Audio"}
        onClick={onMicClick}
      >
        <FontAwesomeIcon
          icon={!streamState.mic ? faMicrophoneSlash : faMicrophone}
          title="Mute"
        />
      </div>

      {/* Video */}
      <div
        className={"meeting-icons " + (!streamState.video ? "active" : "")}
        data-tip={streamState.video ? "Hide Video" : "Show Video"}
        onClick={onVideoClick}
      >
        <FontAwesomeIcon icon={!streamState.video ? faVideoSlash : faVideo} />
      </div>

      {/* Share Screen */}
      <div
        className="meeting-icons"
        data-tip="Share Screen"
        onClick={onScreenClick}
        disabled={streamState.screen}
      >
        <FontAwesomeIcon icon={faDesktop} />
      </div>

      {/* End Call */}
      {isAdmin && (
        <div
          className="meeting-icons active"
          data-tip="End Call"
          onClick={onEndCallClick}
        >
          <FontAwesomeIcon icon={faPhone} />
        </div>
      )}

      <ReactTooltip />
    </div>
  );
};

const mapStateToProps = (state) => ({
  mainStream: state.mainStream,
  currentUser: state.currentUser,
  participants: state.participants,
});

const mapDispatchToProps = (dispatch) => {
  return {
    setMainStream: (stream) => dispatch(setMainStream(stream)),
    addParticipant: (user) => dispatch(addParticipant(user)),
    setUser: (user) => dispatch(setUser(user)),
    removeParticipant: (userId) => dispatch(removeParticipant(userId)),
    updateParticipant: (user) => dispatch(updateParticipant(user)),
    removeAllParticipants: (user) => dispatch(removeAllParticipants(user)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MeetingFooter);

