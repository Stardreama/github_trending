// src/components/RepositoryCard.js

import React from 'react';
import { Card, Tag } from 'antd';
import { StarOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

/**
 * 格式化星数，将数字转换为带有 'k' 的字符串
 * @param {number} stars - 星数
 * @returns {string} 格式化后的星数
 */
const formatStars = (stars) => {
  if (stars >= 1000) {
    return (stars / 1000).toFixed(1) + 'k';
  }
  return stars.toString();
};

const RepositoryCard = ({ repo }) => {
  return (
    <Card
      hoverable
      style={{ width: '100%' }}
      bodyStyle={{ padding: '20px' }}
      className="shadow-md"
    >
      {/* 项目名称 */}
      <a
        href={repo.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xl font-semibold text-blue-600 hover:underline"
      >
        {repo.name}
      </a>

      {/* 分类 */}
      <div className="mt-2">
        <span className="font-medium">分类：</span>
        <Tag color={repo.category === '教程资源' ? 'green' : 'geekblue'}>
          {repo.category}
        </Tag>
      </div>

      {/* 应用领域 */}
      <div className="mt-2">
        <span className="font-medium">应用领域：</span>
        <span>{repo.applicationField}</span>
      </div>

      {/* 技术栈 */}
      <div className="mt-2">
        <span className="font-medium">技术栈：</span>
        <span>{repo.techStack}</span>
      </div>

      {/* 简介 */}
      <div className="mt-2">
        <span className="font-medium">简介：</span>
        <span>{repo.description}</span>
      </div>

      {/* 星数 */}
      <div className="mt-4 flex justify-end items-center">
        <StarOutlined style={{ color: 'gold', marginRight: '5px' }} />
        <span className="font-semibold">{formatStars(repo.stars)}</span>
      </div>
    </Card>
  );
};

RepositoryCard.propTypes = {
  repo: PropTypes.shape({
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    applicationField: PropTypes.string.isRequired,
    techStack: PropTypes.string.isRequired,
    stars: PropTypes.number.isRequired,
    language: PropTypes.string.isRequired,
  }).isRequired,
};

export default RepositoryCard;
