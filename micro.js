
module.exports = { 
    
    getMicro : function getMicro() { 

        var str;
        var rand;
        var micro;
        var arr = [];

        function random() {
            rand = Math.floor(Math.random() * 10);
            return rand;
        }

        for (var i = 0; i < 5; i++) {

            rand = random();
            arr.push(rand);

        }


        micro = arr.join('');
        console.log("Micro-url generated: " + micro);

        return micro;

    }

}
