import React, { useRef, useState } from 'react'
import { Container, Form, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


export default function Login() {
    const navigate = useNavigate()
    const email = useRef()
    const password = useRef()
    const [errors, setErrors] = useState({})
    const login = () => {
        axios.post("http://localhost:7799/login", { email: email.current.value, password: password.current.value })
            .then(res => {
                if (res.data.err === 0) {
                    sessionStorage.setItem('user', res.data.token)
                    navigate("/")
                }
                else if (res.data.err > 0) {
                    setErrors(res.data.msg)
                }
            })
            .catch(err => console.log(err))
    }
    return (
        <Container>
            <Form>
                <Form.Group>
                    <Form.Label>Login</Form.Label>
                    <Form.Control type="text" ref={email} placeholder="email or username" />
                    <Form.Text className="text-danger">{errors.email}</Form.Text>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="Password" ref={password} />
                    <Form.Text className="text-danger">{errors.password}</Form.Text>
                </Form.Group><br />
                <Button variant="primary" className="me-3" onClick={() => login()}>Login </Button>
                <Button variant="outline-primary" onClick={() => navigate("/signup")}>Signup</Button>
            </Form>
        </Container>
    )
}
