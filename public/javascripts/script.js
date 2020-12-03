//const { response } = require("express")

function addToCart(proId) {
    $.ajax({
        url: "/add-to-cart/" + proId,
        type: 'get',
        success: (response) => {
            if (response.stat) {
                let count = $('#cartCount').html()
                count = parseInt(count) + 1
                $('#cartCount').html(count)
                var confirmBox = $("#container"); 
                let msg="Product is Added to cart."
                /* Trace message to display */
                confirmBox.find(".message").text(msg); 
                /* Calling function */
                confirmBox.find(".yes").unbind().click(function()  
                {confirmBox.hide();}); 
                confirmBox.find(".yes").click(); 
                confirmBox.show(); 
            }
            error:(XMLHttpRequest, textStatus, errorThrown)=> { 
                alert("Status: " + textStatus); alert("Error: " + errorThrown); 
            }   
        }
    })
}
function changeQuantity(cartId, proId, pcount) {
    let x = document.getElementById(proId)
    let quantity = parseInt(x.querySelector("input.prodCount").value);
    let count = parseInt(pcount);
    $.ajax({

        url: '/changeProdQuant',
        type: 'POST',
        data: {
            cart: cartId,
            product: proId,
            count: count,
            quantity: quantity,
        },

        success: (response) => {
            if (response.removeProduct) {
                alert("Product Removed")
                location.reload();
            } else {

                x.querySelector("input.prodCount").value = parseInt(quantity + count);
                document.getElementById("total").innerHTML = response.total;
                $(x.querySelector("td.price").innerHTML).load(window.location + x.querySelector(" td.price"))
            }
        }
    })
}
function placeOrder() {
    $("#checkoutForm").submit((e) => {
        e.preventDefault();
        $.ajax({
            url: '/placeOrder',
            type: 'POST',
            data: $('#checkoutForm').serialize(),
            success: (response) => {

                if (response.codSuccess) {
                    location.href = '/placedOrder'
                    alert(response.codSuccess)
                }
                else {
                    alert(response.amount)
                    razorPayment(response)
                }
            }
        })
    })
}
function razorPayment(order) {
  //  let total=order.total*100
   // console.log(total);
    console.log(order.total);
    var options = {
        "key": "rzp_test_P5OE1d50cFS40Q", // Enter the Key ID generated from the Dashboard
        "amount": order.total, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Krishnanunni Sunil",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response) {

            verifyPayment(response, order)
        },
        "prefill": {
            "name": "Krishnanunni Sunil",
            "email": "kitchusunil25@gmail.com",
            "contact": "7306246005"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#DF5353"
        }
    }
    var rzp1 = new Razorpay(options);
    rzp1.on('payment.failed', function (response) {
        alert(response.error.code);
        alert(response.error.description);
        alert(response.error.source);
        alert(response.error.step);
        alert(response.error.reason);
        alert(response.error.metadata);

    });
    rzp1.open();
}
function verifyPayment(payment, order) {
    $.ajax({
        url: '/verifyPayment',
        data: { payment, order },
        type: "POST",
        success: (response) => {
            console.log("response:", response);
            if (response.stat) {
                location.href = '/placedOrder'
            }
            else {
                alert('Looks like you missed several parts of payment,Payment Failed')
            }
        }
    })
}
function viewOrderedProd(orderId, userId) {
    var btn = document.getElementById("myBtn");
    var modal = document.getElementById("myModal");
    var cont = document.getElementById("cont");
    var span = document.getElementsByClassName("close")[0];
    $.ajax({
        url: '/viewOrderedProd',
        type: 'POST',
        data: {
            userId: userId,
            orderId: orderId,
        },
        response: null,
        success: (response) => {
            if (response) {
                console.log(response[0].product);
                modal.style.display = "block";
                span.onclick = function () {
                    modal.style.display = "none";
                    cont.innerHTML = ""
                }
                window.onclick = function (event) {
                    if (event.target == modal) {
                        modal.style.display = "none";
                        cont.innerHTML = ""
                    }
                }
                response.forEach(element => {
                    cont.innerHTML += '<table class="table  m-2" style="text-align: center;font-size: 25px;"><tbody><tr><td style="width: 30rem;" >' + element.product.name + '</td> <td style="width: 10rem;"><img class="" style="width: 4.5rem; height:7rem;" src="/productImages/' + element.product._id + '.png"></img></td> <td style="width: 25rem;">Rs.' + element.product.price + '</td> </tr></tbody></table>'
                    console.log(element.product.name);
                });
            }
        }
    })
}

