const ControlCenterTargeters = {
    /**
     * Makes sure that a certain folder progression is inside the elements path
     */
    "/": {
        /**
         * Filters an array such that only elements that meet the requirements are left
         */
        FilterFunction: (requirement_string, elements) => {
            let required_path = requirement_string.split("/").filter(element => element.length > 0);
            return elements.filter(element => {
                if(element.path.length < required_path.length) return false;

                for(let i = 0; i <= element.path.length - required_path.length; i++){
                    for(let j = 0; j < required_path.length; j++){
                        if(element.path[i + j] !== required_path[j]) break;

                        if(j === required_path.length - 1){
                            return true;
                        }
                    }
                }

                return false;
            });
        }
    },
    /**
     * Makes sure that the element includes a certain tag
     */
    "#": {
        /**
         * Filters an array such that only elements that meet the requirements are left
         */
        FilterFunction: (requirement_string, elements) => {
            let tag = requirement_string.substring(1);
            return elements.filter(element => element.tags.includes(tag));
        }
    },
};

class ControlCenter {
    constructor() {
        this.controlling = [
            { type: "setting", data: { name: "ANumber", type: "number", value: 2 }, path: ["numbers"], tags: ["number", "not_nothing"] }
        ];
    }

    FilterFromSearch(search){
        // Every element separated by a space is a new requirement
        let requirement_strings = search.split(" ").filter(element => element.length > 0);
        let filtering_elements = this.controlling;
        
        for(let requirement_string of requirement_strings){
            // Does this requirement have a targeter?
            let targeter = requirement_string[0] in ControlCenterTargeters ? requirement_string[0] : "/";
            filtering_elements = ControlCenterTargeters[targeter].FilterFunction(requirement_string, filtering_elements);
        }

        return filtering_elements;
    }

    SearchElements(search) {
        return this.controlling;
    }

    Render(screen){
        
    }
}