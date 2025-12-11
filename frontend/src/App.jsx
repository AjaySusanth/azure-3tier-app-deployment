import { useEffect, useState } from "react";

function App() {
  const [apiResponse, setApiResponse] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/health")
      .then(res => res.json())
      .then(data => setApiResponse(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Azure 3-Tier App</h1>
      <p>Backend says: {apiResponse ? JSON.stringify(apiResponse) : "loading..."}</p>
    </div>
  );
}

export default App;
