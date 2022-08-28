import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { Link } from "react-router-dom"
import FILE1 from "../components/files/file1"
import axios from "axios"
import { useRef } from "react"

const Container = styled.div`
  display: flex;
`
const Wrapper = styled.div`
  background-color: #fff;
  width: 30%;
  height: 300px;
  margin: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`
const Item = styled.div`
  margin-bottom: 15px;
`
const Title = styled.label`
  display: block;
`
const Input = styled.input`
  width: 300px;
  height: 30px;
`
const Table = styled.table`
  padding: 0;
  width: 60%;
`
const Tr = styled.tr`
  border: 1px solid #fff;
`
const Th = styled.th`
  border: 1px solid #fff;
`
const Td = styled.td`
  border: 1px solid #fff;
`
const Button = styled.button`
  width: 300px;
  height: 40px;
  cursor: pointer;
`
const Home = () => {
  const [data, setData] = useState([])
  const [postData, setPostData] = useState({})

  const index = useRef(0)
  useEffect(() => {
    fetch("https://traveol.herokuapp.com/api/contact")
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((err) => console.log("Request Failed", err))
  }, [])

  const backgroundSyncAdd = () => {
    navigator.serviceWorker.ready.then((swRegistration) =>
      swRegistration.sync.register("post-data").catch((err) => console.log(err))
    )
  }

  const addData = (data) => {
    const indexedDB = window.indexedDB

    const request = indexedDB.open("cars", 1)
    request.onerror = function (e) {
      console.error("error")
      console.error(e)
    }
    request.onupgradeneeded = function () {
      const db = request.result
      const store = db.createObjectStore("cars", { keyPath: "id" })
      store.createIndex("cars_colour", ["colour"], { unique: false })
      store.createIndex("cars_colour_make", ["colour", "make"], {
        unique: false,
      })
    }
    request.onsuccess = function () {
      const db = request.result
      const transaction = db.transaction("cars", "readwrite")

      const store = transaction.objectStore("cars")

      store.put({ id: index.current, colour: data.name, make: data.email })
      // store.put({ id: 1, colour: postData.name, make: postData.email })
      // store.put({ id: index.current + 2, colour: "red", make: "kia" })
      // store.put({ id: 3, colour: "blue", make: "honda" })
      // store.put({ id: 4, colour: "silver", make: "subaru" })

      transaction.oncomplete = function () {
        db.close()
      }
    }
  }

  const sendAddData = (data) => {
    fetch("https://traveol.herokuapp.com/api/contact", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-type": "application/json; charset=UTF-8" },
    })
      .then((response) => response.json())
      .then((json) => console.log(json))
      .catch((err) => {
        console.log(err)
        addData(data)
        backgroundSyncAdd()
      })
  }

  const handleAdd = () => {
    index.current += 1
    sendAddData(postData)
  }

  /////////////////////////////////////////////////////////

  const backgroundSyncDelete = () => {
    navigator.serviceWorker.ready.then((swRegistration) =>
      swRegistration.sync
        .register("delete-data")
        .catch((err) => console.log(err))
    )
  }

  const deleteData = (data) => {
    const indexedDB = window.indexedDB

    const request = indexedDB.open("deletecars", 1)
    request.onerror = function (e) {
      console.error("error")
      console.error(e)
    }
    request.onupgradeneeded = function () {
      const db = request.result
      const store = db.createObjectStore("cars", { keyPath: "id" })
      store.createIndex("cars_colour", ["colour"], { unique: false })
      store.createIndex("cars_colour_make", ["colour", "make"], {
        unique: false,
      })
    }
    request.onsuccess = function () {
      const db = request.result
      const transaction = db.transaction("cars", "readwrite")

      const store = transaction.objectStore("cars")

      store.put({ id: index.current, colour: data, make: data })

      transaction.oncomplete = function () {
        db.close()
      }
    }
  }

  const sendDeleteData = (data) => {
    fetch(`https://traveol.herokuapp.com/api/contact/${data}`, {
      method: "DELETE",
      headers: { "Content-type": "application/json; charset=UTF-8" },
    })
      .then((response) => response.json())
      .then((json) => console.log(json))
      .catch((err) => {
        console.log(err)
        deleteData(data)
        backgroundSyncDelete()
      })
  }

  const handleDelete = (id) => {
    console.log(id)
    index.current += 1
    sendDeleteData(id)
  }

  return (
    <Container>
      <Table border={1}>
        <Tr>
          <Th>ID</Th>
          <Th>name</Th>
          <Th>email</Th>
          <Th>content</Th>
          <Th>created at</Th>
        </Tr>
        {data.length >= 0 &&
          data.map((item) => (
            <Tr key={item._id}>
              <Td>
                <Link to={`audioID=${item._id}`}>{item._id}</Link>
              </Td>
              <Td>{item.name}</Td>
              <Td>{item.email}</Td>
              <Td>{item.content}</Td>
              <Td>{item.createdAt}</Td>
              <Td>
                <button onClick={() => handleDelete(item._id)}>X</button>{" "}
              </Td>
            </Tr>
          ))}
      </Table>
      <Wrapper>
        <Item>
          <Title>Name</Title>
          <Input
            onChange={(e) => {
              setPostData({
                name: e.target.value,
                email: postData.email,
                content: postData.content,
              })
            }}
            value={postData.name}
          />
        </Item>
        <Item>
          <Title>Email</Title>
          <Input
            onChange={(e) => {
              setPostData({
                name: postData.name,
                email: e.target.value,
                content: postData.content,
              })
            }}
            value={postData.email}
          />
        </Item>
        <Item>
          <Title>Content</Title>
          <Input
            onChange={(e) =>
              setPostData({
                name: postData.name,
                email: postData.email,
                content: e.target.value,
              })
            }
            value={postData.content}
          />
        </Item>
        <Button onClick={handleAdd}>add</Button>
      </Wrapper>
      {/* <Table border={1}>
        <Tr>
          <Th>ID voice</Th>
          <Th>ID Agent</Th>
          <Th>Agent name</Th>
          <Th>ID Customer</Th>
          <Th>Customer name</Th>
          <Th>date</Th>
          <Th>call hold duration</Th>
          <Th>call duration</Th>
        </Tr>
        {data.length >= 0 &&
          data.map((item) => (
            <Tr key={item.audioID}>
              <Td>
                <Link to={`audioID=${item.audioID}`}>{item.audioID}</Link>
              </Td>
              <Td>{item.audioCredit.agent.agentID}</Td>
              <Td>{item.audioCredit.agent.name}</Td>
              <Td>{item.audioCredit.customer.customerID}</Td>
              <Td>{item.audioCredit.customer.name}</Td>
              <Td>{item.audioCredit.date}</Td>
              <Td>{item.audioCredit.callHoldDration}</Td>
              <Td>{item.audioCredit.callDuration}</Td>
              <Td>
                <button onClick={handleDelete}>X</button>{" "}
              </Td>
            </Tr>
          ))}
      </Table> */}
    </Container>
  )
}

export default Home
