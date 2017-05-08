module AtlanticBTApp {
    class Bootstrapper {
        private $amount = $("amount");
        private $total = $("total");

        constructor(){
            chrome.storage.sync.get("total", (items) => {
                let newTotal = 0;
                if(items.total){
                    newTotal += parseInt(items.total);
                }
                
                let amount = this.$amount.val();
                if(amount) {
                    newTotal += parseInt(amount);
                }

                chrome.storage.sync.set({"total": newTotal});
            });
        }
    }
    $(document).ready(() => {
        
    });
}