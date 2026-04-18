using System;
using System.Data;
using System.Data.SqlClient;

public partial class Students : System.Web.UI.Page
{
    // 🔴 Direct connection (no config)
    string connectionString = "Data Source=YOUR_SERVER_NAME;Initial Catalog=YOUR_DB_NAME;Integrated Security=True";

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            LoadStudents();
        }
    }

    // ✅ READ ALL
    private void LoadStudents()
    {
        using (SqlConnection con = new SqlConnection(connectionString))
        {
            string query = "SELECT * FROM Students";

            SqlDataAdapter da = new SqlDataAdapter(query, con);
            DataTable dt = new DataTable();
            da.Fill(dt);

            gvStudents.DataSource = dt;
            gvStudents.DataBind();
        }
    }

    // ✅ INSERT
    protected void btnInsert_Click(object sender, EventArgs e)
    {
        using (SqlConnection con = new SqlConnection(connectionString))
        {
            string query = "INSERT INTO Students(Name, Email, Course) VALUES(@Name, @Email, @Course)";

            SqlCommand cmd = new SqlCommand(query, con);

            cmd.Parameters.AddWithValue("@Name", txtName.Text);
            cmd.Parameters.AddWithValue("@Email", txtEmail.Text);
            cmd.Parameters.AddWithValue("@Course", txtCourse.Text);

            con.Open();
            cmd.ExecuteNonQuery();

            lblMessage.Text = "Inserted successfully";
            LoadStudents();
        }
    }

    // ✅ UPDATE
    protected void btnUpdate_Click(object sender, EventArgs e)
    {
        using (SqlConnection con = new SqlConnection(connectionString))
        {
            string query = "UPDATE Students SET Name=@Name, Email=@Email, Course=@Course WHERE Id=@Id";

            SqlCommand cmd = new SqlCommand(query, con);

            cmd.Parameters.AddWithValue("@Id", Convert.ToInt32(txtId.Text));
            cmd.Parameters.AddWithValue("@Name", txtName.Text);
            cmd.Parameters.AddWithValue("@Email", txtEmail.Text);
            cmd.Parameters.AddWithValue("@Course", txtCourse.Text);

            con.Open();
            cmd.ExecuteNonQuery();

            lblMessage.Text = "Updated successfully";
            LoadStudents();
        }
    }

    // ✅ DELETE
    protected void btnDelete_Click(object sender, EventArgs e)
    {
        using (SqlConnection con = new SqlConnection(connectionString))
        {
            string query = "DELETE FROM Students WHERE Id=@Id";

            SqlCommand cmd = new SqlCommand(query, con);

            cmd.Parameters.AddWithValue("@Id", Convert.ToInt32(txtId.Text));

            con.Open();
            cmd.ExecuteNonQuery();

            lblMessage.Text = "Deleted successfully";
            LoadStudents();
        }
    }

    // ✅ SEARCH (READ ONE)
    protected void btnSearch_Click(object sender, EventArgs e)
    {
        using (SqlConnection con = new SqlConnection(connectionString))
        {
            string query = "SELECT * FROM Students WHERE Id=@Id";

            SqlCommand cmd = new SqlCommand(query, con);
            cmd.Parameters.AddWithValue("@Id", Convert.ToInt32(txtId.Text));

            con.Open();
            SqlDataReader dr = cmd.ExecuteReader();

            if (dr.Read())
            {
                txtName.Text = dr["Name"].ToString();
                txtEmail.Text = dr["Email"].ToString();
                txtCourse.Text = dr["Course"].ToString();

                lblMessage.Text = "Record Found";
            }
            else
            {
                lblMessage.Text = "No Record Found";
            }
        }
    }
}