import React from 'react'
import { LeftSide } from './LeftSide'
import { useLocation, useParams } from 'react-router-dom';

export const MyScreen = ({isLightMode}) => {
  
  const { room } = useParams();
  const location = useLocation();

  const email = location.state?.email || null;

  return (
    <div className='flex flex-row'>
      <LeftSide room={room} email={email} isLightMode={isLightMode}  />
    </div>
  );
};
