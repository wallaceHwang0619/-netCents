import { useEffect, useState } from "react";
import "./Data.css";

const Data = () => {
  const [jsonData, setJsonData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      fetch("http://localhost:3001/api/largest-transaction", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
        .then((res) => res.json())
        .then((json) => {
          setJsonData(json);
          setLoading(false);
        })
        .catch((error) => console.log("error", error));
    };

    fetchData();
    const intervalID = setInterval(fetchData, 300000);

    return () => {
      clearInterval(intervalID);
    };
  }, []);

  const sortJson = (prop) => {
    console.log(prop);
    console.log("before", jsonData);
    setJsonData(jsonData.slice().sort((a, b) => a[`${prop}`] - b[`${prop}`]));
    console.log("after", jsonData);
  };

  if (loading) {
    return <p>Loading data...</p>;
  }
  if (jsonData) {
    return (
      <div>
        <h1>Largest Unconfirmed Transaction(s)</h1>
        <table>
          <thead>
            <tr>
              <th onClick={(e) => sortJson("transactionID")}>transactionID</th>
              <th onClick={(e) => sortJson("hash")}>hash</th>
              <th onClick={(e) => sortJson("total")}>total</th>
              <th onClick={(e) => sortJson("fees")}>fees</th>
              <th onClick={(e) => sortJson("inputs")}>inputs</th>
              <th onClick={(e) => sortJson("outputs")}>outputs</th>
            </tr>
          </thead>
          <tbody>
            {jsonData
              .slice()
              .reverse()
              .map((item) => (
                <tr key={item.transactionID}>
                  <td>{item.transactionID}</td>
                  <td>{item.hash}</td>
                  <td>{item.total}</td>
                  <td>{item.fees}</td>
                  <td>{JSON.stringify(item.inputs)}</td>
                  <td>{JSON.stringify(item.outputs)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  }
  return <p>No data</p>;
};

export default Data;
