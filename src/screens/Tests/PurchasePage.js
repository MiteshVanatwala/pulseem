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
            "grandTotal": 100.00,
            "shipping": 10.00,
            "tax": 10.00,
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
            "grandTotal": 52.00,
            "shipping": 2.00,
            "tax": 10.00,
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
        const orderId = product.orderId;
        const grandTotal = product.grandTotal;
        const shipping = product.shipping;
        const tax = product.tax;
        const orderItems = product.items;

        try {
            window.trackPurchase(orderId, grandTotal, shipping, tax, orderItems);
            alert('purchased');
        } catch (e) {
            console.error(e);
            alert('something went wrong');
        }
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
                    <Button
                        variant='contained'
                        onClick={() => onPurchase(product)}
                        className={clsx(
                            classes.actionButton,
                            classes.actionButtonLightGreen
                        )}>Purchase</Button>
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
            </Grid>
        })}
    </DefaultScreen>
}

export default PurchasePage;