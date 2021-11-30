const handle = (promise) => {
    return promise
        .then(data => ([data, undefined]))
        .catch(error => Promise.resolve([undefined, error]))
}

const deleteProduct = async (btn) => {
    const productId = btn.parentNode.querySelector('[name=productId').value

    const productElement = btn.closest('article')

    try {
        const [result, error] = await handle(fetch('/admin/product/' + productId, {
            method: 'DELETE'
        }))
        
        if (error) {
            throw new Error('Error getting products -> ', error )
        }

        console.log(result.json())

        productElement.parentNode.removeChild(productElement)

    } catch (e) {
        console.log(e)
    }
}