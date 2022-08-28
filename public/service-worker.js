const CACHE_NAME = "Version-1"
const urlsToCache = ["index.html", "https://traveol.herokuapp.com/api/contact"]
const self = this
// install WS
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opend cache")
      return cache.addAll(urlsToCache)
    })
  )
})
// listen for request
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => {
      if (res) {
        console.log("found in cache")
        console.log(event.request)
        console.log(res)
        return res
      }
      console.log("not found")
      console.log(event.request)
      return fetch(event.request)
    })
  )
})

// activate the WS
self.addEventListener("activate", (event) => {
  const cacheWhitelist = []
  cacheWhitelist.push(CACHE_NAME)

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName)
          }
        })
      )
    )
  )
})

const backgroundSync = () => {
  navigator.serviceWorker.ready.then((swRegistration) =>
    swRegistration.sync.register("post-data").catch((err) => console.log(err))
  )
}
///////////////////////////////////////////////////////


const getData = () => {
  const indexedDB = self.indexedDB
  const request = indexedDB.open("cars", 1)
  request.onerror =  function (e) {
    console.error("error")
    console.error(e)
  }
  request.onupgradeneeded = function () {
    const db = request.result
    const store = db.createObjectStore("cars", { keyPath: "id" })
    store.createIndex("cars_colour", ["colour"], { unique: false })
    store.createIndex("cars_colour_make", ["colour", "make"], { unique: false })
  }
  request.onsuccess = function () {
    const db = request.result
    const transaction = db.transaction("cars", "readwrite")
    const store = transaction.objectStore("cars")
    const colourIndex = store.index("cars_colour")
    const makeModeIndex = store.index("cars_colour_make")

    // store.put({id: 1, colour: "red", make: 'toyota'})
    // store.put({id: 2, colour: "red", make: 'kia'})
    // store.put({id: 3, colour: "blue", make: 'honda'})
    // store.put({id: 4, colour: "silver", make: 'subaru'})

    const idQuery = store.get(1)
    // const colourQuery = colourIndex.getAll(["red"])
    // const colourMakeQuery = makeModeIndex.get(["blue", "honda"])
    const colourQueryAll = colourIndex.getAll()
    // idQuery.onsuccess = function () {
    //   console.log("idQuery", idQuery.result)
    // }
    // colourQuery.onsuccess = function () {
    //   console.log("colourQuery", colourQuery.result)
    // }
    // colourMakeQuery.onsuccess = function () {
    //   console.log("colourMakeQuery", colourMakeQuery.result)
    // }
    colourQueryAll.onsuccess = function () {
      console.log("colourQueryAll", colourQueryAll.result)
      // console.log("colourQueryAll", {
      //   name: colourQueryAll.result[0].colour,
      //   email: colourQueryAll.result[0].make,
      // })
      for (const value of colourQueryAll.result) {
        console.log('value', value)
        sendData({
          name: value.colour,
          email: value.make,
        })
        store.delete(value.id)
      }
    }
    transaction.oncomplete = function () {
      db.close()
    }
  }
}

const getDataDelete = () => {
  const indexedDB = self.indexedDB
  const request = indexedDB.open("deletecars", 1)
  request.onerror =  function (e) {
    console.error("error")
    console.error(e)
  }
  request.onupgradeneeded = function () {
    const db = request.result
    const store = db.createObjectStore("cars", { keyPath: "id" })
    store.createIndex("cars_colour", ["colour"], { unique: false })
    store.createIndex("cars_colour_make", ["colour", "make"], { unique: false })
  }
  request.onsuccess = function () {
    const db = request.result
    const transaction = db.transaction("cars", "readwrite")
    const store = transaction.objectStore("cars")
    const colourIndex = store.index("cars_colour")
    const makeModeIndex = store.index("cars_colour_make")

    // store.put({id: 1, colour: "red", make: 'toyota'})
    // store.put({id: 2, colour: "red", make: 'kia'})
    // store.put({id: 3, colour: "blue", make: 'honda'})
    // store.put({id: 4, colour: "silver", make: 'subaru'})

    const idQuery = store.get(1)
    // const colourQuery = colourIndex.getAll(["red"])
    // const colourMakeQuery = makeModeIndex.get(["blue", "honda"])
    const colourQueryAll = colourIndex.getAll()
    // idQuery.onsuccess = function () {
    //   console.log("idQuery", idQuery.result)
    // }
    // colourQuery.onsuccess = function () {
    //   console.log("colourQuery", colourQuery.result)
    // }
    // colourMakeQuery.onsuccess = function () {
    //   console.log("colourMakeQuery", colourMakeQuery.result)
    // }
    colourQueryAll.onsuccess = function () {
      console.log("colourQueryAll", colourQueryAll.result)
      // console.log("colourQueryAll", {
      //   name: colourQueryAll.result[0].colour,
      //   email: colourQueryAll.result[0].make,
      // })
      for (const value of colourQueryAll.result) {
        console.log('value', value)
        sendDeleteData(value.make)
        store.delete(value.id)
      }
    }
    transaction.oncomplete = function () {
      db.close()
    }
  }
}
// getData()
//////////////////////////////////////////////////////

self.addEventListener("sync", (event) => {
  if (event.tag === "post-data") {
    //call method
    getData()
  }
  else if (event.tag === "delete-data") {
    //call method
    getDataDelete()
  }

})


////////////////////////////////////////////////////

const sendData = (data) => {
  fetch("https://traveol.herokuapp.com/api/contact", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-type": "application/json; charset=UTF-8" },
  })
    .then((response) => response.json())
    .then((json) => console.log(json))
    .catch((err) => {
      console.log(err)
      backgroundSync()
    })
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
////////////////////
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

    transaction.oncomplete = function () {
      db.close()
    }
  }
}
