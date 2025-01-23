'use client';

import api from '@/lib/api';
import { useState } from 'react';

type Room = {
  id: string;
  name: string;
};

const CreateRoom = () => {
  const [roomName, setRoomName] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  // Gọi API tạo phòng
  const createRoom = async () => {
    setLoading(true);
    try {
      const response = await api.post('/rooms', { name: roomName });
      setRooms((prevRooms) => [...prevRooms, response.data]);
      setRoomName(''); // Reset input
      setLoading(false);
    } catch (error) {
      console.error('Error creating room:', error);
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Create a new room</h2>
      <input
        type="text"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        className="border p-2 rounded-md w-full mb-4"
        placeholder="Room name"
      />
      <button
        onClick={createRoom}
        className="bg-blue-500 text-white py-2 px-4 rounded-md"
        disabled={loading || !roomName}
      >
        {loading ? 'Creating...' : 'Create Room'}
      </button>

      <div className="mt-4">
        <h3 className="font-semibold">Rooms:</h3>
        <ul>
          {rooms.map((room) => (
            <li key={room.id}>{room.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CreateRoom;
