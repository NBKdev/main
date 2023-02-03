const API_URL = "https://darius-project.herokuapp.com/api";

let webstore = new Vue({
  el: "#app",
  data: {
    lessons: [],
    sortBy: "topic",
    sortOrder: "asc",
    activePage: "lessons",
    name: "",
    phone: "",
    targetLesson: null,
    searchTerm: "",
  },
  methods: {
    togglePage() { // toggle page is to value the active page as the function changes to switch between two pages in the UI
      if (this.activePage === "lessons") {
        this.activePage = "confirm";
      } else {
        this.activePage = "lessons";
      }
    },
    purchaseLesson(lesson) { // the selected lessons can be confirmed before booking the lesson
      this.targetLesson = lesson;
      this.togglePage();
    },
    cancelLesson() { // The allows the cancel the selected lesson and switch back to lessons page
      this.targetLesson = null;
      this.togglePage();
    },
    async confirm() { // This post request to the api allows the fetch to be pushed of the requirements below
      await fetch(`${API_URL}/order`, {
        method: "POST",
        body: JSON.stringify({
          name: this.name,
          phone: this.phone,
          lesson_id: this.targetLesson._id,
          spaces: 1,
        }),
      }).then(async (response) => { // waiting on the fetch api request is complete  then the response is converted to a json object which the data is returned by the api
        let data = await response.json();

        await fetch(`${API_URL}/lesson/${this.targetLesson._id}`, { // this is the put request to the endpoint which the fetch function searches the id of the targetlessons
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ // The json data includes the space which is set to one is to update the selected with the x amount of spaces 
            space: 1, 
          }),
        }).then(() => {
          Swal.fire({ // Swal.fire is used by sweetalert libbrary to display the success message to the users
            title: "Confirmed!", // using the objects such as title, text,icon which the message displayed with the customers name and their phone number which is stored.
            text: `${this.name} Thank you. We will contact you at ${this.phone}. ${data.msg}`,
            icon: "success",
            confirmButtonText: "Cool",
          }).then((result) => { // This function allows to callback the result to user confirming the message 
            if (result.isConfirmed) {
              window.location.reload(); // once confirmed the api will reload the page
            }
          });
        });
      });
    },
    async search() { // This is a search function through the api endpoint
      let response = await fetch(`${API_URL}/search/${this.searchTerm}`, { // search term function is used for the fetch get request to the api
        method: "GET",
      });
      let data = await response.json(); // the response is stored then called by the response.json
      this.lessons = data;

      console.log("data: ", data); // log message will format the values and process information.
    },
    async getLessons() { // This get request allows the api to gather all the lessons that are stored from the database.
      let response = await fetch(`${API_URL}/lesson`, {
        method: "GET",
      });
      let data = await response.json();
      this.lessons = data;
    }
  },
  computed: {
    sortedLessons: function () {
      // if sorting in ascending order
      if (this.sortOrder === "asc") {
        return this.lessons.sort((a, b) =>
          a[this.sortBy] > b[this.sortBy]
            ? 1
            : b[this.sortBy] > a[this.sortBy]
            ? -1
            : 0
        );
      }
      // if sorting in descending order
      return this.lessons.sort((a, b) =>
        a[this.sortBy] > b[this.sortBy]
          ? -1
          : b[this.sortBy] > a[this.sortBy]
          ? 1
          : 0
      );
    },
    canCheckout: function () {
      let isNameCorrect = /^[a-zA-Z\s]*$/.test(this.name); // regex is used to check if name contains letters only
      let isPhoneCorrect = /^[0-9]+$/.test(this.phone) && this.phone.length > 10; // regex is used to check if phone contains number only AND it has more than 11 digits
      return isNameCorrect && isPhoneCorrect;
    },
  },
  mounted() {
    this.getLessons()
  },
  watch: { // This function allows the search term to change values when a letter is being processed
    searchTerm() {
      if(this.searchTerm) {
        this.search();
      } else {
        this.getLessons();
      }
    },
  },
});
