// Abertura e e fechamento do modal {FORM}
const Modal = {
    open(){
        //Abrir Modal
        // Adcionar a class active ao modal.
        document
        .querySelector('.modal-overlay')
        .classList
        .add('active')
    },
    close(){
        //Fechar Modal
        // Removera class active do modal.
        document
        .querySelector('.modal-overlay')
        .classList
        .remove('active')
    }
}

// Amarzenar os dados no localStorage.
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        app.reload()
    },

    // Remoção das transações.
    remove(index) {
        Transaction.all.splice(index, 1)

        app.reload()
    },

    incomes() {
        let income = 0;
        // Pegar todas as transações
        // Para cada transação, 
        Transaction.all.forEach(transaction => {
            // Se for maior que zero
            if(transaction.amount > 0 ) {
                // Somar a uma varivável e retornar a variável
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses() {
        let expense = 0;
        // Pegar todas as transações
        // Para cada transação, 
        Transaction.all.forEach(transaction => {
            // Se for menor que zero
            if(transaction.amount < 0 ) {
                // Somar a uma varivável e retornar a variável
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {

    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {

        const CSSclass = transaction.amount > 0 ? "income" : "expense";

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/img/minus.svg" alt="Remover transação">
            </td>
        `

        return html

    },

    updateBalance() {
        document.getElementById('incomeDisplay')
        .innerHTML = Utils
        .formatCurrency(Transaction
        .incomes())
        
        document.getElementById('expenseDisplay')
        .innerHTML = Utils
        .formatCurrency(Transaction
        .expenses())

        document.getElementById('totalDisplay')
        .innerHTML = Utils
        .formatCurrency(Transaction
        .total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }

}

// Foramatação da Moeda
const Utils = {
    formatAmount(value) {
        value = Math.round(Number(value) * 100)
        return value

        // Usaremos o método Math.round() que arredonda o número que foi passado como argumento,pois alguns números (como o 0.56) fica um resultado bizarro de 56.000.000, essa solução épara eitar qualquer tipo de bug futuro. 
    },

    formatDate(date) {
        // Separação das strings pelo "-";
        const splittedDate = date.split("-")

        // Formatar a data = Dia/Mês/Ano;
        return `
            ${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}
        `
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-br", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value; 

    },  
    
}

// Captura de Dados do Formulário
const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        };
    },

    validateFields() {
        // Criar variáveis para conster os dados específicos.
        const { 
            description, amount, date 
        } = Form.getValues();
        // console.log(description)
       

        // Verificar se todas as informações foram preenchidas (Validar os campos);
        if(
            description.trim() === "" || 
            amount.trim() === "" || 
            date.trim() === "") {
                throw new Error("Prencha todos os campos.")
        }
    },

    formatValues() {
        let { 
            description, amount, date 
        } = Form.getValues();
        
        // Formatar os dados para salvar;
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description, 
            amount,
            date,
        }

        // console.log(date)
    },

    saveTransaction(transaction) {
        //  Salvar as informações adcionadas.
        Transaction.add(transaction)
    },

    clearFields() {
        // Limpar os campos depoisde salvar.
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event){
        event.preventDefault()

        try {
            // Validação;
            Form.validateFields()
            // Formatação;
            const transaction = Form.formatValues()
            // Salvar;
            Form.saveTransaction(transaction)
            // Limpar os campos
            Form.clearFields()
            // Close Modal;
            Modal.close()
            // Update app;
            app.reload()

        } catch(error) {
            alert(error.message)
        }  

        
        // console.log(event)
    }
}

const app = {
    // Inicio da aplicação
    init() {

        Transaction.all.forEach((transaction,index) => {
            // Para cada (forEach) transaction ele irá repetir a função.
            //  Ou seja se existirem três objetos transaction ele irá repetir até 3, se 2 até 2, se mil até mil.
            DOM.addTransaction(transaction, index)
        })
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
        
    },
    // Refresh da aplicação
    reload() {

        DOM.clearTransactions()
        app.init()

    }
}

app.init()