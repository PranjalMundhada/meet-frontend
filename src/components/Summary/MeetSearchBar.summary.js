import { useEffect, useState } from "react";
import "./Summary.css";
import axios from "axios";
import { text } from "@fortawesome/fontawesome-svg-core";


function MeetSearchBar({ chunks }) {

    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const handleSearch = async () => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND}/search`, 
                {
                    chunks
                }, 
                {
                    params: {
                        text: searchText
                    },
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleChange = (e) => {
        setSearchText(e.target.value);
    };

  return (
    <div className="MeetSearchBar">
        <input
        type="text"
        placeholder="Enter search text..."
        value={searchText}
        onChange={handleChange}
      />
      <button onClick={handleSearch}>Search</button>
      <div>
        <h3>Search Results:</h3>
        <ul>
          {searchResults.map((result, index) => (
            <li key={index}>
              <p>Timestamp: ({result.timestamp[0]}, {result.timestamp[1]})</p>
              <p>Text: {result.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default MeetSearchBar;
