import React, { useEffect, useState } from "react"
import styled from "styled-components"
import Alerts from "../components/Alerts"
import Audio from "../components/Audio"
import ContactDetails from "../components/ContactDetails"
import Conversation from "../components/Conversation"
import FILE1 from "../components/files/file1"
import Metadata from "../components/Metadata"
import Phrases from "../components/Phrases"
import Scores from "../components/Scores"

const Top = styled.div`
  display: grid;
  grid-template-columns: 3fr 2fr 4fr;
  grid-gap: 20px;
  margin-bottom: 20px;
  @media screen and (max-width: 576px) {
    display: flex;
    flex-direction: column;
  }
`
const Bottom = styled.div``
const Detail = () => {
  const [data, setData] = useState({})
  useEffect(() => {
    if (window.location.pathname.split("=")[1] < 100) {
      setData(
        FILE1.find(
          (item) => item.audioID == window.location.pathname.split("=")[1]
        )
      )
    }
  }, [])
  return (
    <>
      <Top>
        <ContactDetails data={data !== undefined && data} />
        <Metadata data={data} />
        <Audio />
      </Top>
      <Top>
        <Scores />
        <Alerts data={data} />
        <Phrases data={data} />
      </Top>
      <Bottom>
        <Conversation data={data} />
      </Bottom>
    </>
  )
}

export default Detail
