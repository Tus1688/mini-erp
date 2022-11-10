import Typography from "@mui/material/Typography";
import Grid from "@mui/system/Unstable_Grid";

const Customers = () => {
    return (
        <Grid container spacing={10} bgcolor={'blue'}>
            <Grid xs={1000} border={'thick'}>
                <Typography variant="h4">Customers</Typography>
            </Grid>
            <Grid xs={1} border={'thick'}>
                <Typography variant="h4">Filters</Typography>
            </Grid>
        </Grid>
    );
};

export default Customers;