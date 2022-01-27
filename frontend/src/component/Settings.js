import React, { useEffect, useState, useRef } from 'react'
import { Container, Form, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

import jwt_decode from 'jwt-decode'

export default function Settings() {
    const navigate = useNavigate()
    const [dash, setDash] = useState()
    const companyName = useRef()
    const companyAddress = useRef()
    const companyLogo = useRef()
    const [img, setImg] = useState('')
    useEffect(async () => {
        if (sessionStorage.getItem('user') != undefined) {
            let token = sessionStorage.getItem('user')
            let tmp = await axios.post("http://localhost:7799/dashboard", { headers: { "Authorization": `Bearer ${token}` } })
            setDash(tmp)
            let del = jwt_decode(token)
            setImg(del)
        }
        else {
            alert('login first.')
            navigate("/login")
        }
    }, [])

    const sendMail = () => {
        let token = sessionStorage.getItem('user')
        let data = new FormData()
        data.append('file', document.getElementById('file').files[0])
        axios.post("/file", data, { headers: { 'content-type': 'multipart/form-data', "Authorization": `Bearer ${token}` } })
    }


    const updator = () => {
        let data = new FormData();
        let token = sessionStorage.getItem('user')

        // data.append('cname', cname.current.value);
        //data.append('cadd', cadd.current.value);
        data.append('file', document.getElementById('image').files[0]);
        axios.post(`http://localhost:7799/api/image/${"rahul@gmail.com"}`, data, { headers: { 'content-type': 'multipart/form-data' } })
        alert('due to securty reason login again')
        sessionStorage.removeItem('user')
        navigate('/login');
    }

    return (
        <Container>
            <img src={img.companyLogo} width="400px" height="300px" />
            <Form>
                <Form.Label>Company Logo</Form.Label>
                <input
                    id="image"
                    name="file"
                    type="file"
                />
            </Form>
            <Form>
                <Form.Label>Company Name</Form.Label>
                <Form.Control type="text" ref={companyName} required />
            </Form>
            <Form>
                <Form.Label>Company Address</Form.Label>
                <Form.Control type="address" ref={companyAddress} required />
            </Form>
            <Button variant="" onClick={() => updator()}>Update</Button>
        </Container>
    )
}
