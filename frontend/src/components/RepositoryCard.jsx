import React from 'react';
import { Card } from 'antd';

const { Meta } = Card;

function RepositoryCard({ repo }) {
  return (
    <Card
      hoverable
      title={<a href={repo.url} target="_blank" rel="noopener noreferrer">{repo.name}</a>}
      bordered={false}
    >
      <p><strong>分类：</strong>{repo.category}</p>
      <p><strong>应用领域：</strong>{repo.applicationField}</p>
      <p><strong>技术栈：</strong>{repo.techStack}</p>
      <p>{repo.description}</p>
    </Card>
  );
}

export default RepositoryCard;
