import React, { useRef, useState } from 'react'
import { Container, Form, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
const regName = new RegExp(/^[a-zA-Z]+[a-zA-Z\s]+$/)
//const reguserName = new RegExp(/^[a-zA-Z0-9]([._-](?![._-])|[a-zA-Z0-9]){3,18}[a-zA-Z0-9]$/)
export default function Signup() {
    const navigate = useNavigate()
    const name = useRef()
    const lastName = useRef()
    const email = useRef()
    const userName = useRef()
    const password = useRef()
    const password2 = useRef()
    const [errors, setErrors] = useState({})
    const [imp, setImp] = useState({
        name: '',
        lastName: '',
        password: '',
        password2: ''
    })

    const signup = () => {
        let body = {
            name: name.current.value,
            lastName: lastName.current.value,
            email: email.current.value,
            userName: userName.current.value,
            password: password.current.value,
            password2: password2.current.value
        }
        let valid = {
            name: '',
            lastName: '',
            userName: '',
            password: '',
            password2: ''
        }

        if (!regName.test(body.name)) { valid.name = "Name format incorrect" }
        else { valid.name = "" }

        if (!regName.test(body.lastName)) { valid.lastName = "Name format incorrect" }
        else { valid.lastName = "" }

        if (body.userName.length < 8) { valid.userName = "UserName format incorrect" }
        else { valid.userName = "" }

        if (body.password === body.password2 && body.password.length > 7) {
            valid.password = ""; valid.password2 = ""
        }
        else {
            valid.password = "Password does not match or length less than 8"; valid.password2 = "Password does not match or length less than 8"
        }

        delete body.password2
        //console.log(valid)
        // console.log(Object.keys(valid).reduce((sum, ele) => { console.log(valid[ele].length, ele); return valid[ele].length + sum }, 0))
        if (Object.keys(valid).reduce((sum, ele) => valid[ele].length + sum, 0) === 0) {
            axios.post("http://localhost:7799/signup", body)
                .then(res => {
                    if (res.data.err === 0) { navigate("/") }
                    else if (res.data.err > 0) {
                        setErrors(res.data.msg)
                    }
                })
        }
        setImp(valid)
    }

    return (
        <Container>
            <Form>
                <Form.Group>
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="Name" ref={name} />
                    <Form.Text className="text-danger">{imp.name}</Form.Text>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control type="text" ref={lastName} />
                    <Form.Text className="text-danger">{imp.lastName}</Form.Text>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Email Id </Form.Label>
                    <Form.Control type="email" ref={email} />
                    <Form.Text className="text-danger">{errors.email}</Form.Text>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Username</Form.Label>
                    <Form.Control type="text" ref={userName} />
                    <Form.Text className="text-danger">{errors.userName}</Form.Text>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" ref={password} />
                    <Form.Text className="text-danger">{imp.password}</Form.Text>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control type="password" ref={password2} />
                    <Form.Text className="text-danger">{imp.password2}</Form.Text>
                </Form.Group>
                <Button variant="primary" onClick={() => signup()}>Submit</Button>
            </Form>
        </Container>
    )
}
