const express = require('express');
const app = express();
var fetch = require('node-fetch');
//var bodyParser = require('body-parser');

class basic_laureate{
  constructor(name, id, birth, death)
  {
    this.name = name;
    this.id = id;
    this.birth = birth;
    this.death = death;
  }
}

//folder for view engine and specifying view engine type.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//app.use(bodyParser.urlencoded({extended: true}));

//MiddleWare to handle POST request at laureate/
//var urlencodedParser = bodyParser.urlencoded({extend: true});

var laureate_array = new Array();

fetch('http://api.nobelprize.org/v1/laureate.json')
.then(function(res) {
  return res.json();
})
.then(function(json){
  for(let i = 0; i < 150; i++)
  {
    var one_laureate = new basic_laureate(json.laureates[i].firstname,
    json.laureates[i].id, json.laureates[i].born, json.laureates[i].died);
    laureate_array.push(one_laureate);
  }
});

const port = process.env.port || 3000;
//GET /laureates  prints out their firstnames
app.get('/laureates', (req, res) => {
  let laureate_name = new Array();
  laureate_array.forEach((user) => {
    //res.send(`ID: ${user.id} <br> firstname: ${user.firstname}`);
  laureate_name.push(user.name);
  })
  res.send(laureate_name);
})

//get laureate based on id
app.get('/laureate/:id', (req, res) => {
  var the_id = req.params.id;
  if(the_id > 150)
  {
    res.send("No such Item Found!");
  }
  else {
  res.send(`Name: ${laureate_array[the_id].name}`);
  }
})

//get request for average age
app.get('/laureate/Age-info/av_age', (req, res) => {
  var age_array = new Array();

  for(let person of laureate_array)
  {
      var a_person_b = person.birth.substring(0,4);
      var a_person_d = person.death.substring(0,4);
      var a_person_age = () => {
          if(a_person_d != "0000")
          {
              return a_person_d - a_person_b;
          }
          else
              return 2017 - a_person_b;
      }
      age_array.push(a_person_age());

  }

  var av_age = 0;
  for(let an_age of age_array)
  {
      av_age += an_age;
  }

  res.send(`<h1>Fun Fact !</h1><br><br>The average life-span
    of a Nobel Prize Laureate is? ${Math.round(av_age/age_array.length)} years\n`);

})

//sends information of a laureate
app.get('/laureate/find_laureate/:a_laureate', (req, res) => {
  var the_laureate = req.params.a_laureate;
  var found = false;
  for(let person of laureate_array)
  {
    if(person.name == the_laureate)
    {
      found = true;
       res.send(`ID: ${person.id} <br>
         first name: ${person.name}<br>
         Date of Birth: ${person.birth}<br>
         Date of Death: ${person.death}<br>`);
    }
    }
    if(!found)
    {
      res.send("Person not found!")
    }
  })

  //Gets everyone
  app.get('/', (req, res) => {
    res.render('laureate', {
      title: "laureates",
      users: laureate_array
    })
  })

   var age_found = false;
  //gets age of person
  app.get('/laureate/find_age/:name', (req, res) =>{
    var name_of_laureate = req.params.name;
    laureate_array.forEach((persons) => {
      if(persons.name == name_of_laureate)
      {
        var an_person_b = persons.birth.substring(0,4);
        var an_person_d = persons.death.substring(0,4);
            if(an_person_d != "0000")
            {
                var result = an_person_d - an_person_b;
            }
            else
            {
              var result =  2017 - an_person_b;
            }
                res.send(`${name_of_laureate} is ${result} years old!`)
      }
    })
        if(!age_found)
        {
          res.send(`${name_of_laureate} was not found!`)
        }
  })

//post request adds user to the apiform type
  app.post('/laureates/add', function(req, res){
    var newLaureate  = new basic_laureate(req.body.name, (laureate_array.length + 3),
       req.body.born, req.body.died);
       laureate_array.push(newLaureate);
    //console.log(newLaureate);
  })

  //post request adds user to the api NON form type
    app.post('/laureates/adds/:name/:dob/:dod', function(req, res){
      var newLaureate  = new basic_laureate(req.params.name, (laureate_array.length + 3),
         req.params.dob, req.params.dod);
          laureate_array.push(newLaureate);
          res.send("Post request accepted")
      //console.log(newLaureate);
    })

var change = false;
  app.put('laureates/:current_name/:new_name', (req, res) => {
      var laureate_name = req.params.current_name;
      var laureate_new_name = req.params.new_name;
      laureate_array.forEach((user2) => {
        if(user2.name == laureate_name)
        {
          var update_person = new basic_laureate(user2.laureate_name,
          user2.id, user2.birth, user2.death);
          laureate_array.pop(user2);
          laureate_array.push(update_person);
          change = true;
        }
      })
      if(!change)
      {
        res.send("Not found or Changed")
      }
      else{
        res.send("Found and Changed!")
      }
  })

   var copy_array = new Array();

  app.put('/User/:name/:another_name', (req, res) => {
    laureate_array.forEach((a_name) => {
      if(a_name.name == req.params.name)
      {
        var updateperson = new basic_laureate(req.params.another_name,
        a_name.id, a_name.birth, a_name.death);
        copy_array.push(updateperson);
        change = true;
      }
      else {
        copy_array.push(a_name);
      }
    })

    if(!change)
    {
      res.send(`${req.params.name} Was Not found`);
    }
    else {
      laureate_array = copy_array;
      res.send(`Succesfull PUT! <br>`)
    }
  })


var found = false;
var new_array = new Array();
  app.delete('/laureates/:delete', function(req, res) {
    laureate_array.forEach((user1) => {
      if(user1.name == req.params.delete)
      {
        found = true;
      }
      else{
        new_array.push(user1);
      }
    })
    if(!found)
    {
      res.send("Person not found")
    }
    else{
      laureate_array = new_array;
      res.send("Found and Removed")
    }
  })

app.listen(port, function () {
  console.log('Example app listening on port 3000!')
})
