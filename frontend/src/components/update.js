import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Update = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [token, setToken] = useState('');
    const [expire, setExpire] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();

    //refresh token dan mengambil token baru
    const refreshToken = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/token');
            setToken(response.data.accessToken);
            const decoded = jwtDecode(response.data.accessToken);
            setName(decoded.name);
            setExpire(decoded.exp);
        } catch (error) {
            if (error.response) {
                setMsg(error.response.data.msg || 'Failed to fetch new token.');
                navigate('/');
            }
        }
    }, [navigate]);

    const getUserById = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:5000/users/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`, 
                },
            });
            setName(response.data.name);
            setEmail(response.data.email);
        } catch (error) {
            if (error.response) {
                setMsg(error.response.data.msg || 'Failed to fetch user data.');
            }
        }
    }, [id, token]);

    // Memanggil refreshToken dan getUserById saat komponen pertama kali dimuat
    useEffect(() => {
        refreshToken();
    }, [refreshToken]);

    useEffect(() => {
        if (token) {
            getUserById();
        }
    }, [token, getUserById]);

    const updateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `http://localhost:5000/users/${id}`,
                {
                    name: name,
                    email: email,
                    ...(password && { password }), // Menambahkan password hanya jika diisi
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Menambahkan token ke header
                    },
                }
            );
            navigate('/dashboard');
        } catch (error) {
            if (error.response) {
                setMsg(error.response.data.msg || 'Failed to update user.');
            }
        }
    };

    return (
        <section className="hero has-background-grey-light is-fullheight is-fullwidth">
            <div className="hero-body">
                <div className="container">
                    <div className="columns is-centered">
                        <div className="column is-4-desktop">
                            <form onSubmit={updateUser} className="box">
                                <p className="has-text-centered has-text-danger">{msg}</p>

                                <div className="field mt-5">
                                    <label className="label">Name</label>
                                    <div className="controls">
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="field mt-5">
                                    <label className="label">Email</label>
                                    <div className="controls">
                                        <input
                                            type="email"
                                            className="input"
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="field mt-5">
                                    <label className="label">Password</label>
                                    <div className="controls">
                                        <input
                                            type="password"
                                            className="input"
                                            placeholder="New Password (optional)"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="field mt-5">
                                    <button className="button is-success is-fullwidth">
                                        Update
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Update;
