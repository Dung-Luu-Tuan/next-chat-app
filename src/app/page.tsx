'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { TrashIcon } from '@heroicons/react/24/solid';

interface Text {
  id: string;
  text: string;
}

export default function TextManager() {
  const [texts, setTexts] = useState<Text[]>([]);
  const [newText, setNewText] = useState<string>('');
  console.log('kk', texts);

  useEffect(() => {
    // Lấy danh sách texts từ API
    const fetchTexts = async () => {
      try {
        const response = await api.get('/texts');
        console.log('hehe', response.data);

        setTexts(response.data);
      } catch (error) {
        console.error('Error fetching texts:', error);
      }
    };

    fetchTexts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    if (!newText) {
      return;
    }
    e.preventDefault();
    try {
      const response = await api.post('/texts', { text: newText });
      setTexts(response.data);
      setNewText(''); // Clear input
    } catch (error) {
      console.error('Error adding text:', error);
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this text?'
    );
    if (!isConfirmed) return;

    try {
      const response = await api.delete(`/texts/${id}`);
      setTexts(response.data);
      setNewText('');
    } catch (error) {
      console.error('Error remove text:', error);
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className="w-1/2 m-12 p-4 bg-gray-400 rounded-sm">
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <div className="w-full flex flex-row justify-between bg-white rounded-sm">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Add new..."
              className="border-none outline-none text-black px-4 py-2 rounded w-full"
            />
            <button
              type="submit"
              className="text-xs bg-blue-500 text-white px-2 m-2 rounded-sm"
            >
              Add
            </button>
          </div>
        </form>
        <ul>
          {texts.map((item) => (
            <li
              key={item.id}
              className="text-sm text-black flex flex-row justify-between border-b py-1"
            >
              {item.text}
              <TrashIcon
                className="size-6 text-blue-500 cursor-pointer"
                onClick={() => handleDelete(item.id)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
