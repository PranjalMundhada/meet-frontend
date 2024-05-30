import "./Summary.css";
import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { firestore } from "../../server/firebase";
import Markdown from 'react-markdown'
import ShowMoreText from "react-show-more-text";
import Modal from 'react-modal';

const MODEL_NAME = process.env.REACT_APP_MODEL_NAME;
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY; 

// Set the app element for accessibility
Modal.setAppElement('#root');

function MeetSummary({ setSummarized, transcribed, text, roomId }) {

    const [response, setResponse] = useState("");
    const [modalIsOpen, setIsOpen] = React.useState(false);

    const summaryCollectionRef = firestore.collection(`summary`).doc(roomId);
    summaryCollectionRef.get().then(docSnapshot => {
        if (!docSnapshot.exists) {
            firestore.collection(`summary`).doc(roomId).set({}); 
        }
    });

    const handleSummarize = async () => {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const generationConfig = {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
        };

        const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        ];

        const parts = [{ text }];

        try {
            const result = await model.generateContent({
                contents: [{ role: "user", parts }],
                generationConfig,
                safetySettings,
            });

            const generatedText = result.response.text();
            await summaryCollectionRef.update({
                [Date.now()]: {
                    summary: generatedText
                }
            });

        } catch (error) {
            console.error("Error generating content:", error);
        } 
    };

    //if already saved in firestore fetch that data
    useEffect(() => {
        const fetchSummaryData = async () => {
            const docSnapshot = await summaryCollectionRef.get();
            if (docSnapshot.exists) {
                const summaryData = docSnapshot.data();
                if (summaryData) {
                    console.log(summaryData);
                    const latestKey = Object.keys(summaryData).sort().pop();
                    const latestData = summaryData[latestKey];
                    
                    if (latestData && latestData.summary) {
                        setResponse(latestData.summary);
                        setSummarized(true);
                    }
                }
            }
        };
    
        fetchSummaryData();
    }, [roomId, summaryCollectionRef, setResponse, setSummarized, transcribed]);
    

    useEffect(() => {
        if (transcribed) {
            handleSummarize();
        }
    }, [transcribed]);

    function openModal() {
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
    }

  return (
    <div className="MeetSummary">
        <div>
            {transcribed && !response && (
                <div>
                    Generating Summary...
                </div>
            )}
            <ShowMoreText onClick={openModal} >
                {response && (
                    <div>
                        <p>Summary:</p>
                        <Markdown>{typeof response === 'object' ? JSON.stringify(response) : response}</Markdown>
                    </div>
                )}
            </ShowMoreText>
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal} >
                {response && (
                    <div>
                        <p>Summary:</p>
                        <Markdown>{typeof response === 'object' ? JSON.stringify(response) : response}</Markdown>
                    </div>
                )}
            </Modal>
        </div>
    </div>
  );
}

export default MeetSummary;
