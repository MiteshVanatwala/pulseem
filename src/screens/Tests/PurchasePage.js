import {
    Grid,
    Typography,
    Divider,
    Button
} from "@material-ui/core";
import DefaultScreen from "../DefaultScreen";
import clsx from 'clsx'

const PurchasePage = ({ props, classes }) => {
    const products = [
        {
            "orderId": 10,
            "grandTotal": "100.00",
            "shipping": "10.00",
            "tax": "10.00",
            "items": [
                {
                    "name": "IPhone 10",
                    "quantity": 1,
                    "itemCode": "IP10T",
                    "price": 80
                }
            ]
        },
        {
            "orderId": 11,
            "grandTotal": "52.00",
            "shipping": "2.00",
            "tax": "10.00",
            "items": [
                {
                    "name": "IPhone 13",
                    "quantity": 1,
                    "itemCode": "IP13T",
                    "price": 40
                }
            ]
        }
    ];

    const onPurchase = (product) => {
        window.trackPurchase(product.orderId, product.grandTotal, product.shipping, product.tax, product.items)
    }

    return <DefaultScreen
        currentPage="groups"
        classes={classes}
        containerClass={clsx(classes.management, classes.mb50)}
    >
        {products.map((product) => {
            return <Grid container style={{ paddingTop: 90 }}>
                <Grid item xs={4}>
                    <Typography>{product.items[0].name}</Typography>
                </Grid>
                <Grid item xs={2}>
                    <Typography>{product.items[0].price}</Typography>
                </Grid>
                <Grid item xs={4}>
                    <Typography>{product.grandTotal} (Shipping: {product.shipping}, Tax: {product.tax})</Typography>
                </Grid>
                <Grid item xs={2}>
                    <Button onClick={() => onPurchase(product)}>Purchase</Button>
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
            </Grid>
        })}
    </DefaultScreen>
}

export default PurchasePage;