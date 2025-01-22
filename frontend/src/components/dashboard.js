/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [name, setName] = useState('');
    const [token, setToken] = useState('');
    const [expire, setExpire] = useState('');
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        refreshToken();
        getUsers();
    }, []);
 
    const refreshToken = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/token');
            setToken(response.data.accessToken);
            const decoded = jwtDecode(response.data.accessToken);
            setName(decoded.name);
            setExpire(decoded.exp);
        } catch (error) {
            if (error.response) {
                navigate("/");
            }
        }
    }, [navigate]);

    const axiosJWT = axios.create();

    axiosJWT.interceptors.request.use(async (config) => {
            const currentDate = new Date();
            if (expire * 1000 < currentDate.getTime()) {
                const response = await axios.get('http://localhost:5000/token');
                config.headers.Authorization = `Bearer ${response.data.accessToken}`;
                setToken(response.data.accessToken);
                const decoded = jwtDecode(response.data.accessToken);
                setName(decoded.name);
                setExpire(decoded.exp);
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    const getUsers = useCallback(async () => {
        try {
            const response = await axiosJWT.get('http://localhost:5000/users', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(response.data);
        } catch (error) {
            console.error(error);
        }
    }, [axiosJWT, token]);

    const handleDelete = async (id) => {
        try {
            await axiosJWT.delete(`http://localhost:5000/users/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            getUsers();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (id) => {
        navigate(`/edit-user/${id}`);
    };

    useEffect(() => {
        refreshToken();
        getUsers();
    }, [refreshToken, getUsers]);

    return (
        <div className="container mt-5">
            <h1>Welcome Back: {name}</h1>

            <button className="button is-primary" onClick={() => navigate('/dashboard/create')}>
                Add User
            </button>

            <table className="table is-striped is-fullwidth">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={user.id}>
                            <td>{index + 1}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                                <button
                                    className="button is-info mr-2"
                                    onClick={() => handleEdit(user.id)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="button is-danger"
                                    onClick={() => handleDelete(user.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Dashboard;