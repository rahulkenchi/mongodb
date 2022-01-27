import React, { useEffect, useState } from 'react'
import { Container, Card } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import jwt_decode from 'jwt-decode'

export default function Dashboard() {
    const navigate = useNavigate()
    const [items, setItems] = useState('')

    useEffect(async () => {
        if (sessionStorage.getItem('user') != undefined) {
            let token = sessionStorage.getItem('user')
            let email = jwt_decode(token).email
            let tmp = await axios.post("http://localhost:7799/dashboard", { email: email }, { headers: { "Authorization": `Bearer ${token}` } })
            setItems(tmp.data)
        }
        else {
            alert('login first.')
            navigate("/login")
        }
    }, [])

    const tick = (i) => {
        navigate("/invo", { state: { status: i } })
    }
    return (
        <Container style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <Card onClick={() => tick('total')}>
                <Card.Body >
                    <Card.Title>{items.total}</Card.Title>
                    <Card.Text>Total Invoices generated</Card.Text>
                </Card.Body>
            </Card>
            <Card onClick={() => tick('UNPAID')}>
                <Card.Body >
                    <Card.Title>{items.unpaid}</Card.Title>
                    <Card.Text>Unpaid Invoices</Card.Text>
                </Card.Body>
            </Card>
            <Card onClick={() => tick('PAID')}>
                <Card.Body>
                    <Card.Title>{items.paid}</Card.Title>
                    <Card.Text>Paid Invoices</Card.Text>
                </Card.Body>
            </Card>
        </Container >
    )
}
