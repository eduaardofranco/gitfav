import { GithubUser } from "./GithubUser.js"



//this class will have the data logic
export class Favorites {
    constructor(root) {

        this.root = document.querySelector(root)

        this.load()

        this.tbody = this.root.querySelector('table tbody')

    }

    load() {
        //get the data from browser storage, if there isnt, just create an array
         this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []

    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    }

    async add(username) {
        try {

            //check if the user is already in the array
            const userExists = this.entries.
            find(entry => (entry.login).toLowerCase() === (username).toLowerCase())

            //if user exists, throw an error
           if(userExists) {
            throw new Error('User already registred')
           }

            const user = await GithubUser.search(username)

            if(user.login === undefined) {
                throw new Error('User not found')
            }
            //put the user inside the entries array
            this.entries = [user, ...this.entries]
            this.update()
            this.save()

        } catch(error) {
            alert(error.message)
        }
    }

    //make a filter and check if element clicked on remove 
    //is the same element in entries array
    delete(user) {

        //create a new array without this element removed
        const filteredEntries = this.entries.
        filter(entry => entry.login !== user.login)
        
        //replace the entries array with the new filteredEntries array
        this.entries = filteredEntries
        this.update()
        this.save()
    }
}

//this class will create the html view and events
export class FavoritesView extends Favorites{
    constructor(root) {
        super(root)

        this.update()
        this.onadd()
    }

    onadd() {
        const addButton = document.querySelector('header button')
        addButton.onclick = (e) => {
            e.preventDefault()
            const { value } = this.root.querySelector('header input') 
            this.add(value)

            this.root.querySelector('header input').value = ''
        }
    }


    update() {
        this.removeAllTr()

       
        this.entries.forEach((user) => {
            const row = this.createRow()
            row.querySelector('.profile img').src = `https://github.com/${user.login}.png`
            row.querySelector('.profile img').alt = `Imagem de ${user.name}`
            row.querySelector('.profile a').href = `https://github.com/${user.login}`
            row.querySelector('.profile p').textContent = user.name
            row.querySelector('.profile span').textContent = `/${user.login}`
            row.querySelector('.repositories').textContent = user.public_repos
            row.querySelector('.followers').textContent = user.followers
            
            row.querySelector('.action-remove').onclick = (e) => {
                e.preventDefault()
                const isOk = confirm('Are you sure you want to delete this row?')
                if(isOk) {
                    this.delete(user)
                }
            }
            
            this.tbody.append(row)
        })
        
        if(this.entries.length == 0){
            const emptyDiv = document.querySelector('tfoot > tr')
            console.log('vazio')
            emptyDiv.classList.remove('hide')
        } else {
            const emptyDiv = document.querySelector('tfoot > tr')
            emptyDiv.classList.add('hide')
            console.log('nao vazio')
        }

    }
    

    //create a tr tag and put the html content inside
    createRow() {
        const tr = document.createElement('tr')

        tr.innerHTML = 
        `
        <td class="profile">
            <img src="" alt="">
            <a href="" target="blank">
                <p></p>
                <span></span>
            </a>
        </td>
        <td class="repositories"></td>
        <td class="followers"></td>
        <td>
            <a class="action-remove" href="">Remove</a>
        </td>
        `
        
        return tr

    }

    //remove all tr from tbody when the function is invoqued
    removeAllTr() {
        
        this.tbody.querySelectorAll('tr')
        .forEach((tr) => {
            tr.remove()
        })

    }
}