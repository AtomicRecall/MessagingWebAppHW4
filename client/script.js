//when the user first logs in, fetch all messages in the /message fetch request and display them to screen
//they should all be on the left side.
const socket = io();
let isLogggedIn = false;

fetch('/assignUsername')
    .then(res => res.json())
    .then(data => {

        let username = data.username;
        document.querySelector("h3").innerHTML += ` <span id="username">${username}</span>`;
        fetch("/AllMessages",{
            method: "GET",
        })
        .then(response =>{
                if(!response.ok){
                    throw new Error(`Messages were not able to be obtained! Status code:${response.status}`);
                }
                return response.json();
        })
        .then(data =>{
            
            if(data.length > 0){
                console.log("Retieved messages from server!");

                for(const pieceOfData of data){

                    let time = new Date (pieceOfData.timeStamp);

                    let divider = document.createElement('div');
                        divider.id = "messagee";
                        divider.innerHTML = `<span id="username">`+pieceOfData.username+"</span>: <b>"+pieceOfData.message+"</b> "+`<span id="date">`+(time.getMonth()+1)+"/"+time.getDate()+" "+time.getHours()+":"+time.getMinutes()+":"+time.getSeconds()+"</span>";
                        document.getElementById("messages").appendChild(divider);

                }
            }
            else{
                let divider = document.createElement('div');
                    divider.id = "empty";
                    divider.innerHTML = "<------------------------EMPTY CHAT------------------------";
                    document.getElementById("messages").appendChild(divider);
            }
            
        })


        document.getElementById("send").onclick = async () => {
            
            let messageToFrontEnd;

            if(!document.getElementById("input").value){
                alert("You typed in an empty message! Please type in a message before sending it.");
                return;
            }
            else{
                messageToFrontEnd = document.getElementById("input").value;
                
            }

            (document.getElementById("empty") ? document.getElementById("empty").remove() : null);

            document.getElementById("send").style.opacity = "0";
            document.getElementById("send").disabled = true;

            document.getElementById("input").value = "";
            let time = new Date();

            await fetch("/AllMessages",{
                method: "POST",
                headers:{
                    "Content-type":"application/json"
                },
                body: JSON.stringify({

                    message: messageToFrontEnd,
                    timeStamp: time,
                    username: username
                })
            }).then(response =>{
                if(!response.ok){
                    throw new Error(`Error Message was NOT able to be sent! Status code:${response.status}`);
                }
                else{
                    console.log("Successfully Added!");
                }
                
            })
            

            
            
        }   

        socket.on('new_message', (msg) => {
            (document.getElementById("empty") ? document.getElementById("empty").remove() : null);
            
            let time = new Date(msg.timeStamp);
            let divider = document.createElement('div');
            divider.id = "messagee";
            (isLogggedIn) ? divider.classList.add("loggedIn") : null;

            document.getElementById("messages").appendChild(divider);

            (msg.username === username) 
            ?( 
                divider.classList.add("IsUser"),
                divider.innerHTML = `<span id="date">${(time.getMonth()+1)}/${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}</span> <b>${msg.message}</b> :<span id="username">${msg.username}</span>`
            )
            :
                divider.innerHTML = `<span id="username">${msg.username}</span>: <b>${msg.message}</b> <span id="date">${(time.getMonth()+1)}/${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}</span>`

            
        });

        document.getElementById("login").onclick = function(e){
            e.preventDefault();

            (document.getElementById("registerForm") ? document.getElementById("registerForm").remove() : null);
            (document.getElementById("loginForm") ? document.getElementById("loginForm").remove() : null);
            
            let loginForm = document.createElement('form');
            loginForm.id = "loginForm";

            let usernameInput = document.createElement('input');
            usernameInput.placeholder = "Enter Username";
            usernameInput.type = "text";
            loginForm.appendChild(usernameInput);

            let passwordInput = document.createElement('input');
            passwordInput.placeholder = "Enter Password";
            passwordInput.type = "password";    
            loginForm.appendChild(passwordInput);

            let loginButton = document.createElement('button');
            loginButton.innerHTML = "Login";    
            loginForm.appendChild(loginButton);

            document.getElementById("AccountButtons").appendChild(loginForm);

            loginForm.onsubmit = function(e){
                e.preventDefault(); 

                fetch("/Login",{
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({
                        username: usernameInput.value,
                        password: passwordInput.value
                    })
                }).then(response =>{
                    if(!response.ok){   
                        alert(`Wrong Username or Password! Status code: ${response.status}`);
                    }
                    else{
                        document.getElementById("send").style.backgroundColor = "#007aff";
                        (document.getElementById("username") ? document.getElementById("username").remove() : null);
                        document.querySelector("h3").innerHTML+= ` <span id="username">${usernameInput.value}</span>`;
                        username = usernameInput.value;

                        isLogggedIn = true;
                        console.log("Successfully Logged In!");
                        let divider = document.createElement('div');
                        divider.innerHTML = "Successfully Logged In!"; 
                        divider.style.color = "white";
                        divider.id = "success";
                        document.getElementById("AccountButtons").appendChild(divider);
                        
                        document.getElementById("login").innerHTML = "Logout";
                        document.getElementById("loginForm").remove();
                        
                    }
                });
            }



           
        }

        document.getElementById("register").onclick = function(e){
            e.preventDefault();

            (document.getElementById("loginForm") ? document.getElementById("loginForm").remove() : null);
            (document.getElementById("registerForm") ? document.getElementById("registerForm").remove() : null);

            let registerForm = document.createElement('form');
            registerForm.id = "registerForm";

            let usernameInput = document.createElement('input');
            usernameInput.placeholder = "Create Username";
            usernameInput.type = "text";
            registerForm.appendChild(usernameInput);

            let passwordInput = document.createElement('input');
            passwordInput.placeholder = "Create Password";
            passwordInput.type = "password";    
            registerForm.appendChild(passwordInput);

            let registerButton = document.createElement('button');
            registerButton.innerHTML = "Register";    
            registerForm.appendChild(registerButton);
            
            document.getElementById("AccountButtons").appendChild(registerForm);
            
            registerForm.onsubmit = function(e){
                e.preventDefault();
                fetch("/Account",{
                method: "POST",
                headers:{
                    "Content-type":"application/json"
                },
                body: JSON.stringify({
                    username: usernameInput.value,
                    password: passwordInput.value
                })
            }).then(response =>{
                if(!response.ok){
                    throw new Error(`Error Account was NOT able to be created! Status code: ${response.status}`);
                }
                else{

                    document.getElementById("registerForm").remove();

                    let divider = document.createElement('div');
                    divider.innerHTML = "Successfully Created an Account!"; 
                    divider.style.color = "white";
                    divider.id = "success";
                    document.getElementById("AccountButtons").appendChild(divider);

                    console.log("Successfully Created your Account!");
                    
                }
                
            })
            }
            
        }

    });


document.getElementById("input").addEventListener('input', (event) => {

    (event.target.value.length > 0)
    ?
        (document.getElementById("send").disabled = false,
        document.getElementById("send").style.opacity =  "1")
    :
        (document.getElementById("send").disabled = true,
        document.getElementById("send").style.opacity =  "0");
}
);

