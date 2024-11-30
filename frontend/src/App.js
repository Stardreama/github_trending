// src/App.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import { List, Spin, Alert } from "antd";
import RepositoryCard from "./components/RepositoryCard";

function App() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/trending");
        //服务器端const response = await axios.get("/api/trending");
        setRepos(response.data);
      } catch (err) {
        setError("无法获取数据，请稍后再试。");
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-4">
        <Alert message="错误" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">GitHub 每日热点</h1>
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={repos}
        renderItem={(item) => (
          <List.Item>
            <RepositoryCard repo={item} />
          </List.Item>
        )}
      />
    </div>
  );
}

export default App;
