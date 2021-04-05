import React from 'react'
import logo from '../../logo.svg';
import './Login.css';
import users from '../../db/db.json'
import { useHistory } from "react-router-dom";
import { useFormik } from 'formik';

export default function Login() {
    let history = useHistory();
    const createNewRoom = (values) => {
        history.push(`/videochat/qwerty/${values.username}`);
    }
    const validate = values => {
        let isUser = users.some(user => user.username === values.username);
        let isRightPassword = users.some(user => user.password === values.password);
        const errors = {};      
        if (!values.username) {
          errors.username = 'Username Required';
        } else if (!isUser) {
          errors.username = 'Invalid Username';
        }
        if (!values.password) {
            errors.password = 'Password Required';
          } else if (!isRightPassword) {
            errors.password = 'Invalid password';
          }
        return errors;
      };
    const formik = useFormik({
        initialValues: {
          username: '',
          password: '',
        },
        validate,
        onSubmit: values => {
            createNewRoom(values)
        },
      });
    return (
        <div className="Login__Header">
            <img src={logo} className="Login__Logo" alt="logo" />
            <p> Hi There! Welcome to my VideoChatApp with WebRTC </p>
            <form className="Login__Form" onSubmit={formik.handleSubmit}>
                <label htmlFor="username">Username</label>
                <input 
                    className="Login__Input" 
                    type="text" 
                    id="username"
                    name="username"
                    onChange={formik.handleChange}
                    value={formik.values.username}
                />
                  {formik.errors.username ? <div className="Login__Error">{formik.errors.username}</div> : null}
                <label htmlFor="password">Password</label>
                <input 
                    className="Login__Input"
                    type="password"
                    name="password"
                    id="password"
                    onChange={formik.handleChange}
                    value={formik.values.password}
                />
                  {formik.errors.password ? <div  className="Login__Error">{formik.errors.password}</div> : null}
                <button className="Login__Button" type="submit">Login</button>
            </form>
        </div>
    )
}
