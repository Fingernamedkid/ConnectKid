import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchTop102Weeks, fetchTop10Least } from '../lib/axios'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const LeaderboardContext = createContext();

export const LeaderboardProvider = ({ children }) => {
  const [blocks, setBlocks] = useState([]); 
  const [leastBlocks, setLeastBlocks] = useState([]);

  const fetchLeaderboard = async () => {
    try {
      console.log('Leaderboard: Fetching data');
      const data = await fetchTop102Weeks();
      setBlocks(data);
      console.log('Leaderboard: Data fetched');
    } catch (error) {
      console.error('Failed fetching data: ', error);
    }
  };

  const fetchLeastStepsLeaderboard = async () => {
    try {
      console.log('Leaderboard: Fetching least steps data');
      const leastData = await fetchTop10Least();
      setLeastBlocks(leastData);
      console.log('Leaderboard: Least steps data fetched');
    } catch (error) {
      console.error('Failed fetching least steps data: ', error);
    }
  };

  useEffect(async () => {
    const jwt = await AsyncStorage.getItem('jwt');
    if (jwt) {
      fetchLeaderboard();
      fetchLeastStepsLeaderboard();
    }
  }, []); 

  return (
    <LeaderboardContext.Provider value={{ blocks, leastBlocks, fetchLeaderboard, fetchLeastStepsLeaderboard }}>
      {children}
    </LeaderboardContext.Provider>
  );
};

export const useLeaderboard = () => {
  return useContext(LeaderboardContext);
};
