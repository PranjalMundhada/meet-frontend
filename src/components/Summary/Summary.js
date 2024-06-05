import "./Summary.css";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MeetRecording from './MeetRecording.summary';
import Messages from "./Messages.summary";
import MeetTranscribe from "./MeetTranscribe.summary";
import MeetSearchBar from "./MeetSearchBar.summary";
import MeetSummary from "./MeetSummary.summary";

function Summary() {

  const {roomId} = useParams();
  const [chunks, setChunks] = useState([]);
  const [text, setText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [transcribed, setTranscribed] = useState(false);
  const [summarized, setSummarized] = useState(false);

  const handleChunksChange = (newChunks) => {
    setChunks(newChunks);
  };

  const handleTextChange = (newText) => {
    setText(newText);
  };

  const handleProcess = () => {
    setProcessing(true);
  };

  useEffect(() => {
    if (transcribed && summarized) {
      setProcessed(true);
    }
  }, [transcribed, summarized]);


  return (
    <div className="Summary">

      {!processed && (
        <button onClick={handleProcess} disabled={processing} className="Summary-button">
          {processing ? 'Processing...' : 'Start Process'}
        </button>
      )}

      {processing && (
        <>
          <div className="summary-left">
            <MeetRecording roomId={roomId} />
            <MeetSummary setSummarized={setSummarized} transcribed={transcribed} text={text} roomId={roomId} />
          </div>
          <div className="summary-right">
            <Messages roomId={roomId} />
            <div className="summary-right-sub">
              <MeetSearchBar chunks={chunks} />
              <MeetTranscribe setTranscribed={setTranscribed} onChunksChange={handleChunksChange} onTextChange={handleTextChange} roomId={roomId} />
            </div>
          </div>
        </>
      )}

    </div>
  );
}

export default Summary;
