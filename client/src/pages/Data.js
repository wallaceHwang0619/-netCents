import { useEffect, useState } from "react";
import "./Data.css";

const Data = () => {
  const [jsonData, setJsonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState({});

  const types = ["transactionID, hash, total, fees, inputs, outputs"];

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

  const sortJson = (v) => {
    setSort({
      value: v,
      ascending: sort.value === v ? !sort.ascending : false,
    });
  };

  if (loading) {
    return <p>Loading data...</p>;
  }
  if (jsonData) {
    return (
      <div className="data-container">
        <h1>Largest Unconfirmed Transaction(s)</h1>
        <table>
          <thead>
            <tr>
              <th
                className="hoverable"
                onClick={(e) => sortJson("transactionID")}
              >
                transactionID
                {sort.value === "transactionID"
                  ? sort.ascending
                    ? " ↑"
                    : " ↓"
                  : ""}
              </th>
              <th>hash</th>
              <th className="hoverable" onClick={(e) => sortJson("total")}>
                total
                {sort.value === "total" ? (sort.ascending ? " ↑" : " ↓") : ""}
              </th>
              <th className="hoverable" onClick={(e) => sortJson("fees")}>
                fees
                {sort.value === "fees" ? (sort.ascending ? " ↑" : " ↓") : ""}
              </th>
              <th>inputs</th>
              <th>outputs</th>
            </tr>
          </thead>
          <tbody>
            {(sort.ascending
              ? jsonData.slice().sort((a, b) => a[sort.value] - b[sort.value])
              : jsonData.slice().sort((a, b) => b[sort.value] - a[sort.value])
            ).map((item) => (
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
