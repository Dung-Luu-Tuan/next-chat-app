'use client';

import api from '@/lib/api';
import Picker from '@emoji-mart/react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type User = {
  id: string;
  username: string;
};

type Messages = {
  content: string;
  id?: string;
  room_id: string;
  user_id: string;
};

const Chat = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Messages[]>([]);
  const [input, setInput] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>();
  const [chatPartner, setChatPartner] = useState<User>();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const handleEmojiSelect = (emoji: { native: string }) => {
    if (inputRef.current) {
      // Thêm emoji vào vị trí con trỏ
      const newInput =
        input.slice(0, cursorPosition) +
        emoji.native +
        input.slice(cursorPosition);

      // Cập nhật giá trị input mới
      setInput(newInput);

      // Đặt lại con trỏ vào vị trí sau emoji
      if (inputRef.current) {
        setCursorPosition((prev) => prev + 2);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Kết nối WebSocket khi component được mount
  useEffect(() => {
    if (roomId) {
      socketRef.current = new WebSocket(`ws://localhost:8080/ws/${roomId}`);

      socketRef.current.onopen = () => {
        console.log('Connected to WebSocket');
      };

      socketRef.current.onmessage = (event) => {
        console.log('Received message:', event.data);
        const data = JSON.parse(event.data);
        const message: Messages = {
          id: '',
          room_id: roomId,
          user_id: data?.user_id || '',
          content: data?.message || '',
        };
        setMessages((prevMessages) => [...prevMessages, message]);
      };

      socketRef.current.onclose = () => {
        console.log('WebSocket closed');
      };

      return () => {
        socketRef.current?.close();
      };
    }
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Lấy tất cả tin nhắn trong phòng
  const fetchMessages = async (roomId: string) => {
    try {
      const response = await api.get(`/messages/${roomId}`);
      const data = await response.data;
      setMessages(data); // Cập nhật tin nhắn vào state
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  // Lấy danh sách người dùng
  const fetchUsers = async () => {
    try {
      const response = await api.get('/users'); // API lấy danh sách người dùng
      const data: User[] = await response.data;
      const current = JSON.parse(localStorage.getItem('user') || '{}');
      const filteredUsers = data.filter((user) => user.id !== current.id);

      setCurrentUser(current);
      setUsers(filteredUsers);
      if (filteredUsers.length > 0) {
        handleUserClick(filteredUsers[0]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (socketRef.current && input && roomId) {
      // Gửi tin nhắn qua WebSocket
      const message = JSON.stringify({
        message: input,
        user_id: currentUser?.id,
      });
      socketRef.current.send(message);

      // Lưu tin nhắn qua API
      await sendMessage(roomId, input);
      setInput('');
      setShowEmojiPicker(false);
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  // Lưu tin nhắn qua API
  const sendMessage = async (roomId: string, messageContent: string) => {
    try {
      // Lấy thông tin người dùng hiện tại từ localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!user) {
        console.error('No user found');
        return;
      }

      const userId = user.id; // Lấy ID người dùng từ localStorage

      // Gửi yêu cầu API lưu tin nhắn với room_id, user_id và nội dung tin nhắn
      await api.post(`/messages/${roomId}`, {
        user_id: userId, // ID của người gửi
        content: messageContent, // Nội dung tin nhắn
      });
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (inputRef.current) {
      console.log(
        'inputRef.current.style.height',
        inputRef.current.style.height
      );

      inputRef.current.style.height = 'auto';

      inputRef.current.style.height = `${inputRef.current.scrollHeight + 5}px`;
    }
    const mappingText = convertTextToEmoji(e.target.value);
    setInput(mappingText);
  };

  const handleCursorChange = () => {
    if (inputRef.current) {
      setCursorPosition(inputRef.current.selectionStart ?? 0);
    }
  };

  const convertTextToEmoji = (text: string) => {
    const emojiMapping: { [key: string]: string } = {
      ':)': '\u{1F60A}', // Mặt cười 😊
      ':D': '\u{1F604}', // Mặt cười lớn 😄
      ':(': '\u{1F61E}', // Mặt buồn ☹️
      ':-)': '\u{1F60A}', // Mặt cười 😊
      ':-D': '\u{1F604}', // Mặt cười lớn 😄
    };

    console.log('go here', text);

    return text.replace(
      /(:\)|:D|:\(|:-\)|:-D)/g,
      (match) => emojiMapping[match] || match
    );
  };

  useEffect(() => {
    fetchUsers(); // Lấy danh sách người dùng khi component mount
  }, []);

  const handleUserClick = async (targetUser: User) => {
    try {
      // Lấy thông tin người dùng hiện tại từ localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!user) {
        console.error('No user found');
        return;
      }

      const user1Id = user.id; // ID của người dùng hiện tại (user1)

      // Gửi yêu cầu API tạo phòng với user1_id và user2_id
      const response = await api.post('/room', {
        user1_id: user1Id, // ID của người dùng hiện tại
        user2_id: targetUser.id, // ID của đối tác mà bạn muốn tạo phòng với
      });

      const room = await response.data; // Lấy dữ liệu phòng chat từ response
      setChatPartner(targetUser);
      setRoomId(room.id); // Cập nhật roomId sau khi tạo phòng
      fetchMessages(room.id); // Lấy tin nhắn trong phòng vừa tạo
    } catch (error) {
      console.error('Failed to create room for user:', error);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-200 p-4 m-2 rounded-xl">
        {/* Hiển thị danh sách người dùng */}
        <div className="mt-2 text-black">
          <h2 className="font-bold text-2xl mb-2">Users</h2>
          <ul>
            {users.map((user) => (
              <li
                key={user.id}
                className={`px-2 py-4 text-lg cursor-pointer rounded ${
                  chatPartner?.id === user.id
                    ? 'bg-blue-300'
                    : 'hover:bg-blue-300'
                }`}
                onClick={() => handleUserClick(user)}
              >
                {user.username}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Chat box */}
      <div className="w-3/4 flex flex-col m-2 rounded-t-xl">
        <div className="flex p-4 bg-gray-300 text-black font-bold text-2xl rounded-t-xl">
          {chatPartner?.username || ''}
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100 shadow-md">
          {/* Hiển thị tin nhắn */}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`w-full flex ${
                msg.user_id === currentUser?.id ? 'justify-end' : ''
              }`}
            >
              <div
                className={`max-w-96 text-black bg-white p-2 mb-2 rounded-xl shadow-sm overflow-auto break-words ${
                  msg.user_id === currentUser?.id ? 'bg-blue-300' : ''
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex flex-row gap-3 items-center p-4 bg-gray-100 border-t rounded-b-xl">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onSelect={handleCursorChange}
            onFocus={handleCursorChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter your message"
            className="text-base w-full h-auto max-h-[144px] overflow-auto p-3 border text-black rounded-md shadow-md outline-none break-words resize-none"
          />

          <button
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="text-2xl"
          >
            {'\u{1F60A}'}
          </button>
          {showEmojiPicker && (
            <div
              className="absolute bottom-20 right-10"
              onBlur={() => setShowEmojiPicker(false)}
            >
              <Picker onEmojiSelect={handleEmojiSelect} />
            </div>
          )}
          <Image
            src="/icons8-sent-48.png"
            alt="Send Icon"
            width={36}
            height={36}
            onClick={handleSendMessage}
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
