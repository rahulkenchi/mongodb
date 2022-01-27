import React, { useState, useEffect, useRef } from 'react'
import { Container, Row, Col, Image, Table, Button, Modal, Form, FormControl } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Pdf from "react-to-pdf";
import axios from 'axios'
import jwt_decode from 'jwt-decode'

export default function Invoice() {
    const navigate = useNavigate()
    const [up, setUp] = useState(false)
    const [I, setI] = useState('')
    const itemName = useRef()
    const quantity = useRef()
    const price = useRef()
    const discount = useRef()
    const ref = useRef()
    const date = useRef()
    const dueDate = useRef()
    const receiver = useRef()
    const receiverAddress = useRef()
    const [show, setShow] = useState(false);
    const [invoiceItems, setInvoiceItems] = useState('')
    const [list, setList] = useState([])
    const [total, setTotal] = useState(0)
    const options = {
        orientation: 'portrait',
        unit: 'in',
        format: 'A4'
    };
    useEffect(async () => {
        if (sessionStorage.getItem('user') != undefined) {
            let token = sessionStorage.getItem('user')
            let email = jwt_decode(sessionStorage.getItem('user')).email
            let tmp = await axios.post('http://localhost:7799/invoice2', { email: email }, { headers: { "Authorization": `Bearer ${token}` } })
            setInvoiceItems(tmp.data)
        }
        else {
            alert('login first.')
            navigate("/login")
        }
    }, [])

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const add = () => {
        let body = {
            item: itemName.current.value,
            quantity: quantity.current.value,
            price: price.current.value,
            discount: discount.current.value,
            amount: price.current.value * (100 - discount.current.value) * quantity.current.value / 100
        }
        let tmp = list
        tmp.push(body)
        setList([...tmp])
        setTotal(tmp.reduce((sum, ele) => ele.amount + sum, 0))
    }

    const edit = () => {
        let body = {
            item: itemName.current.value,
            quantity: quantity.current.value,
            price: price.current.value,
            discount: discount.current.value,
            amount: price.current.value * (100 - discount.current.value) * quantity.current.value / 100
        }

        let tmp = list
        tmp[I] = body
        setList([...tmp])
        setTotal(tmp.reduce((sum, ele) => ele.amount + sum, 0))
    }

    const dele = (i) => {
        let tmp = list
        if (list.length === 1) {
            setList([])
            tmp = []
        }
        else {
            tmp.splice(i, 1)
            setList([...tmp])
        }
        setTotal(tmp.reduce((sum, ele) => ele.amount + sum, 0))
    }

    const order = () => {
        let body = {
            "sender": jwt_decode(sessionStorage.getItem('user')).email,
            "receiver": receiver.current.value,
            "receiverAddress": receiverAddress.current.value,
            "invoiceDate": date.current.value,
            "dueDate": dueDate.current.value,
            "products": list,
            "amount": total,
            "status": "UNPAID"
        }

        if (body.receiver != '' && body.receiverAddress != '' && body.invoiceDate != '' && body.dueDate != '' && body.dueDate >= body.invoiceDate) {
            if (list.length != 0) {
                let token = sessionStorage.getItem('user')
                axios.post("http://localhost:7799/invoice", { "body": body }, { headers: { "Authorization": `Bearer ${token}` } })
                    .then(res => {
                        if (res.data.err > 0)
                            console.log(res.data.msg)
                        else if (res.data.err === 0)
                            console.log("data saved OK")
                    })
                    .catch(err => { console.log.error("ERROR") })
            }
        }
        else {
            alert('Please fill receiver details and invoice dates correctly.')
        }
    }

    const check = () => {
        if (itemName.current.value != '' && quantity.current.value != '' && price.current.value != '' && discount.current.value != '') {
            if (quantity.current.value > 0 && price.current.value > 0 && discount.current.value >= 0 && discount.current.value <= 100) {
                add();
            }
        }
        else { alert('do not leave any field empty') }
    }

    const checkedited = () => {
        if (itemName.current.value != '' && quantity.current.value != '' && price.current.value != '' && discount.current.value != '') {
            if (quantity.current.value > 0 && price.current.value > 0 && discount.current.value >= 0 && discount.current.value <= 100) {
                edit(); setShow(false)
            }
        }
        else { alert('do not leave any field empty') }
    }

    const sendMail = () => {
        let data = new FormData();
        data.append('file', document.getElementById('pdf').files[0]);
        console.log(document.getElementById('pdf').files[0]);
        axios.post(`http://localhost:7799/api/mail/rahul@gmail.com`, data, { headers: { 'content-type': 'multipart/form-data' } })
    }

    return (
        <div>
            <Container className="mt-2 p-4" ref={ref} >
                <Row>
                    <Col>
                        <Image src="https://image.shutterstock.com/image-vector/abstract-initial-letter-s-logo-260nw-1862762845.jpg" alt="Please insert ot=r update company img" width="250px" height="150px" />
                    </Col>
                    <Col style={{ textAlign: "end" }}>
                        <h2>Invoice</h2>
                        <h5>No :</h5>
                        <h4>{invoiceItems.invoiceNumber}</h4>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Row>
                            <h4>From</h4>
                            <p>{invoiceItems.name} {invoiceItems.lastName}<br />
                                {invoiceItems.companyName}<br />
                                {invoiceItems.companyAddress}</p>
                        </Row>
                        <Row>
                            <h4>Bill To</h4>
                            <FormControl type="text" ref={receiver} />
                            <FormControl type="text" ref={receiverAddress} />
                        </Row>
                    </Col>
                    <Col style={{ textAlign: "end" }}>
                        <h6>Status</h6>
                        <h3 style={{ color: 'red' }}>Unpaid</h3>
                        <h6>Date</h6>
                        <input type="date" ref={date} />
                        <h6>Due Date</h6>
                        <input type="date" ref={dueDate} />
                        <h6>Amount</h6>
                        <h3>{total} Rs</h3>
                    </Col>
                </Row>
                <Row>
                    <Table striped hover>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Disc(%)</th>
                                <th>Amount</th>
                                <th style={{ textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((ele, index) =>
                                <tr>
                                    <td>{ele.item}</td>
                                    <td>{ele.quantity}</td>
                                    <td>{ele.price}</td>
                                    <td>{ele.discount}</td>
                                    <td>{ele.amount}</td>
                                    <td style={{ textAlign: 'center' }}><Button onClick={() => { setUp(true); setShow(true); setI(index) }}>Edit</Button><Button variant="danger" className="ms-3" onClick={() => dele(index)}>Delete</Button></td>
                                </tr>
                            )}
                            <tr>
                                <td colSpan={4} className="text-end">Total</td>
                                <td>
                                    {total}
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                    <h6><Button variant="primary" onClick={handleShow}>Add Item</Button></h6>
                </Row>
            </Container >

            <Row>
                <Pdf targetRef={ref} filename="code-example.pdf" options={options} scale={0.6} x={1}>
                    {({ toPdf }) => <Button onClick={toPdf}>Generate Pdf</Button>}
                </Pdf>
                <Button
                    variant="contained"
                    component="label"
                >
                    Send Mail
                    <input
                        id="pdf"
                        name="file"
                        type="file"
                        onChange={() => sendMail()}
                        required
                    />
                </Button>
            </Row>
            <Row>
                <Button onClick={() => order()}>Order</Button>
            </Row>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Item</Form.Label>
                        <Form.Control type="text" ref={itemName} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Quantity</Form.Label>
                        <Form.Control type="number" ref={quantity} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Price</Form.Label>
                        <Form.Control type="number" ref={price} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Discount</Form.Label>
                        <Form.Control type="number" ref={discount} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    {!up ?
                        <>
                            <Button variant="primary" onClick={() => { check(); setShow(false) }}>
                                Save and Close
                            </Button>
                            <Button variant="primary" onClick={() => check()}>
                                Save and Add more
                            </Button>
                        </>
                        :
                        <Button variant="warning" onClick={() => checkedited()}>
                            Save Changes
                        </Button>
                    }
                </Modal.Footer>
            </Modal>
        </div>
    )
}
