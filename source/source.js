const fragmento = document.createDocumentFragment()
const menuBtn = document.querySelector('.burguer__btn')
const mobileMenu = document.querySelector('.mobile__menu')
const bar = document.querySelector('.bar__container')
const regexp = new RegExp(/^(ftp|http|https):\/\/[^ "]+$/)
const errorLabel = document.querySelector('.label__state')
const form = document.getElementById('form')
const linkInput = document.getElementById('link')
const containerMain = document.querySelector('.url__items')
const urlApi = 'https://api.shrtco.de/v2/shorten?url='
const indexedDB = window.indexedDB
let open = false

// indexedDB
if (indexedDB) {
    let db
    const request = indexedDB.open('urllist', 1)

    request.onsuccess = ()=>{
        db = request.result
        readData()
    }
    request.onupgradeneeded = () =>{
        db = request.result
        const objectStore = db.createObjectStore('urls', {
            autoIncrement: true 
        })
    }
    request.onerror = (error) =>{
        console.log(error)
    }
    const addData = (data) =>{
        const transaction = db.transaction(['urls'], 'readwrite')
        const objectStore = transaction.objectStore('urls')
        const request = objectStore.add(data)
        
    }
    const readData = () =>{
        const transaction = db.transaction(['urls'], 'readonly')
        const objectStore = transaction.objectStore('urls')
        const request = objectStore.openCursor()
        request.onsuccess = (e) =>{
            const cursor = e.target.result
            if (cursor) {
                // create elements
                let divFather = document.createElement('div')
                let prevlink = document.createElement('p')
                let divChild = document.createElement('div')
                let newLink = document.createElement('p')
                let copyBtn = document.createElement('button')
                // Add classlist to those elements
                divFather.classList.add('url__item')
                prevlink.classList.add('prev__link')
                divChild.classList.add('newLink')
                newLink.classList.add('new__link')
                copyBtn.classList.add('copy__link')
                // Setting values to those elements
                prevlink.textContent = cursor.value.oldlink
                newLink.textContent = cursor.value.shortedLink
                copyBtn.textContent = 'Copy'
                // Including the elements into the DOM
                divChild.appendChild(newLink)
                divChild.appendChild(copyBtn)
                divFather.appendChild(prevlink)
                divFather.appendChild(divChild)
                fragmento.appendChild(divFather)
                copyBtn.addEventListener('click', copy)
                cursor.continue()
            }
            else{
                containerMain.appendChild(fragmento)
            }
        }
    }
    // menu mobile open and close
    menuBtn.addEventListener('click', ()=>{
        if (!open) {
            mobileMenu.style.display = 'flex'
            menuBtn.textContent = ''
            open = true
        }
        else{
            mobileMenu.style.display = 'none'
            menuBtn.textContent = ''
            open = false
        }
    })
    // form handle submit
    form.addEventListener('submit', shorter)
    async function shorter(e){
        e.preventDefault()
        if (regexp.test(linkInput.value)) {
            linkInput.classList.remove('error__input')
            errorLabel.classList.remove('error__label')
            // showing the progress bar
            bar.style.display = 'block'
            let response = await fetch(`${urlApi}${linkInput.value}`).then(res => res.json())
            try {
            // create elements
            let divFather = document.createElement('div')
            let prevlink = document.createElement('p')
            let divChild = document.createElement('div')
            let newLink = document.createElement('p')
            let copyBtn = document.createElement('button')
            // Add classlist to those elements
            divFather.classList.add('url__item')
            prevlink.classList.add('prev__link')
            divChild.classList.add('newLink')
            newLink.classList.add('new__link')
            copyBtn.classList.add('copy__link')
            // Setting values to those elements
            prevlink.textContent = response.result.original_link
            newLink.textContent = response.result.short_link
            copyBtn.textContent = 'Copy'
            // Including the elements into the DOM
            divChild.appendChild(newLink)
            divChild.appendChild(copyBtn)
            divFather.appendChild(prevlink)
            divFather.appendChild(divChild)
            fragmento.appendChild(divFather)
            containerMain.appendChild(fragmento)
            // Hiddinfg the progress bar
            bar.style.display = 'none'
            form.reset()
            copyBtn.addEventListener('click', copy)

            const data ={
                oldlink: response.result.original_link,
                shortedLink: response.result.short_link
            }
            addData(data)
            } catch (error) {
                bar.style.display = 'none'
                linkInput.textContent = 'Something went wrong, try again'
                linkInput.classList.add('error__input')
                errorLabel.classList.add('error__label')
            }

        }
        else{
            linkInput.textContent = 'Please add a valid link'
            linkInput.classList.add('error__input')
            errorLabel.classList.add('error__label')
        }
    }
    // copy link
    async function copy(e){
        let sibling = e.target.previousElementSibling.textContent
        await navigator.clipboard.writeText(sibling)
        e.target.style.backgroundColor = 'var(--Dark-Violet)'
        e.target.textContent = 'Copied!'
    }
}