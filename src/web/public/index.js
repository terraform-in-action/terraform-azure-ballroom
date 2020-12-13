window.onload = refreshTweets()

function addTweet(tweet){
    let tweetNode = document.createElement("div")
    tweetNode.className = "tweet"
    let bNode = document.createElement("b")
    bNode.innerText = tweet.name
    tweetNode.appendChild(bNode)
    let pNode = document.createElement("p")
    pNode.innerText = tweet.message
    tweetNode.appendChild(pNode)
    document.getElementById("tweets").appendChild(tweetNode)
}

function refreshTweets(){
    fetch(`/api/tweet`,{method:'GET'}).then((res) => {
        res.json().then((jsonTweets)=>{
            document.getElementById("tweets").innerHTML=""
            jsonTweets.forEach((tweet)=>{
                addTweet(tweet)
            })
        })
    })
    .catch((e) => {
        console.log("An error occured: " + e)
    })
}

function tweet() {
    let message = document.getElementById("message").value
    document.getElementById("message").value = ""
    let name = document.getElementById("name").value
    document.getElementById("name").value = ""
    data = JSON.stringify({name,message})
    fetch(`/api/tweet`,{method:'POST',body:data}).then((res) => {
        refreshTweets()
    })
    .catch((e) => {
        console.log("An error occured: " +e)
    })
}

