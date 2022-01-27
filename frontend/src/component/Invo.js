import React, { useEffect, useState } from 'react'
import jwt_decode from 'jwt-decode'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
export default function Invo() {
    const navigate = useNavigate()
    const location = useLocation()
    const [items, setitems] = useState([])
    useEffect(async () => {
        if (sessionStorage.getItem('user') != undefined) {
            let token = sessionStorage.getItem('user')
            let email = jwt_decode(sessionStorage.getItem('user')).email
            let tmp = await axios.post('http://localhost:7799/invoice3', { email: email, status: location.state.status }, { headers: { "Authorization": `Bearer ${token}` } })
            console.log(tmp.data)
        }
        else {
            alert('login first.')
            navigate("/login")
        }
    }, [])

    return (
        <div>

        </div>
    )
}
