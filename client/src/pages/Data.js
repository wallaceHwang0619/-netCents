import { useEffect, useState } from "react";

const Data = () => {
  const [jsonData, setJsonData] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      fetch("http://localhost:3001/api/largest-transaction", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
        .then((res) => res.json())
        .then((json) => setJsonData(json))
        .catch((error) => console.log("error", error));
    }, 3000);
  }, []);

  if (jsonData) {
    return (
      <div>
        <h1>Largest Unconfirmed Transaction(s)</h1>
        <table>
          <thead>
            <tr>
              <th>transactionID</th>
              <th>hash</th>
              <th>total</th>
              <th>fees</th>
              <th>inputs</th>
              <th>outputs</th>
            </tr>
          </thead>
          <tbody>
            {jsonData.map((item) => (
              <tr key={item.transactionID}>
                <td>{item.transactionID}</td>
                <td>{item.hash}</td>
                <td>{item.total}</td>
                <td>{item.fees}</td>
                <td>{JSON.stringify(item.inputs)}</td>
                <td>{JSON.stringify(item.inputs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return <p>Loading data...</p>;
};

export default Data;
