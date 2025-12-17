// src/components/ui/Loading/Loading.jsx
// Unified loading component for consistent loading states across the application

import React from 'react';
import styles from './Loading.module.css';

/**
 * Loading spinner component
 * @param {object} props - Component props
 * @param {string} props.text - Optional loading text to display
 * @param {string} props.size - Size of spinner: 'small', 'medium' (default), 'large'
 * @param {boolean} props.fullscreen - Whether to show fullscreen overlay
 * @param {boolean} props.dark - Whether to use dark theme
 * @returns {JSX.Element} Loading component
 */
const Loading = ({
  text = '',
  size = 'medium',
  fullscreen = false,
  dark = false,
}) => {
  const containerClasses = [
    styles.Loading,
    fullscreen && styles['Loading--fullscreen'],
    dark && styles['Loading--dark'],
  ].filter(Boolean).join(' ');

  const spinnerClasses = [
    styles.Loading__spinner,
    size === 'small' && styles['Loading__spinner--small'],
    size === 'large' && styles['Loading__spinner--large'],
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className={spinnerClasses} role="status" aria-label="Загрузка"></div>
      {text && <p className={styles.Loading__text}>{text}</p>}
    </div>
  );
};

export default Loading;

