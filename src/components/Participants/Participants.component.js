import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "./Participants.css";
import { connect } from "react-redux";
import { firestore } from "../../server/firebase";
import { Participant } from "./Participant/Participant.component";

const Participants = (props) => {

  const {roomId} = useParams();
  const videoRef = useRef(null);
  let participantKey = Object.keys(props.participants);
  const [endCall, setEndCall] = useState();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = props.stream;
      videoRef.current.muted = true;
    }
  }, [props.currentUser, props.stream]);

  const currentUser = props.currentUser
    ? Object.values(props.currentUser)[0]
    : null;

  let gridCol =
    participantKey.length === 1 ? 1 : participantKey.length <= 4 ? 2 : 4;
  const gridColSize = participantKey.length <= 4 ? 1 : 2;
  let gridRowSize =
    participantKey.length <= 4
      ? participantKey.length
      : Math.ceil(participantKey.length / 2);

  const screenPresenter = participantKey.find((element) => {
    const currentParticipant = props.participants[element];
    return currentParticipant.screen;
  });

  if (screenPresenter) {
    gridCol = 1;
    gridRowSize = 2;
  }

  const participants = participantKey.map((element, index) => {
    const currentParticipant = props.participants[element];
    const isCurrentUser = currentParticipant.currentUser;
    if (isCurrentUser) {
      return null;
    }
    const pc = currentParticipant.peerConnection;
    const remoteStream = new MediaStream();
    let curentIndex = index;
    if (pc) {
      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
        const videElement = document.getElementById(
          `participantVideo${curentIndex}`
        );
        if (videElement) videElement.srcObject = remoteStream;
      };
    }

    return (
      <Participant //remote video
        key={curentIndex}
        currentParticipant={currentParticipant}
        curentIndex={curentIndex}
        hideVideo={screenPresenter && screenPresenter !== element}
        showAvatar={
          !currentParticipant.video &&
          !currentParticipant.screen &&
          currentParticipant.name
        }
      />
    );
  });

  useEffect(() => {
    const unsubscribe = firestore.collection("endCall").doc(roomId)
      .onSnapshot((endCallSnapshot) => {
        if (endCallSnapshot.exists) {
          const endCallData = endCallSnapshot.data();
          const latestKey = Object.keys(endCallData).sort().pop();
          const latestData = endCallData[latestKey];
          console.log(latestData.endCall);
          setEndCall(latestData.endCall);
        } else {
          console.error("No end call data found for roomId:", roomId);
        }
      }, (error) => {
        console.error("Error fetching end call data:", error);
      });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [roomId]);
  
  return (
    <div
      style={{
        "--grid-size": gridCol,
        "--grid-col-size": gridColSize,
        "--grid-row-size": gridRowSize,
      }}
      className={`participants`}
    >
      {participants}
      {currentUser && !endCall ? (
        <Participant // user video
          currentParticipant={currentUser}
          curentIndex={participantKey.length}
          hideVideo={screenPresenter && !currentUser.screen}
          videoRef={videoRef}
          showAvatar={currentUser && !currentUser.video && !currentUser.screen}
          currentUser={true}
        />
      ) : (
        <div className="meeting-ended-message">Meeting has ended</div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    participants: state.participants,
    currentUser: state.currentUser,
    stream: state.mainStream,
  };
};

export default connect(mapStateToProps)(Participants);
